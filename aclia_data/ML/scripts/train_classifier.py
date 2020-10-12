import sys
sys.path.append('../../../actes-ia-data/ML')

import argparse
import logging
import os
import shutil
from itertools import product
import warnings

import pandas as pd
import yaml
from sklearn.feature_extraction.text import CountVectorizer

import classifier
import data
import xgboost as xgb

warnings.filterwarnings("ignore")
logging.basicConfig(format='%(asctime)s %(levelname)s:%(message)s', level = logging.INFO)

def product_dict(**kwargs):
    """Cartesian product of lists with their corresponding dictionary keys
    
    """
    keys = kwargs.keys()
    vals = kwargs.values()
    for instance in product(*vals):
        yield dict(zip(keys, instance))
        
def label_scores(score):
    """Return a list combining the labels and the metrics (ex: '2_precision') and a list with the corresponding values
    
    :param score: dict obtained from sklearn classification report
    """
    label_keys = []
    label_values = []
    
    metric_keys = ['precision', 'recall', 'support']
    
    for label_key, score_dict in list(score.items())[:-3]:
        updated_dict = {metric_key: score_dict[metric_key] for metric_key in metric_keys}
        
        for metric_key, metric_value in list(updated_dict.items()):
            label_keys.append(label_key+'_'+metric_key)
            if metric_key == 'support':
                label_values.append(metric_value)
            else:
                label_values.append(round(metric_value*100, 2))
            
    return label_keys, label_values

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Load data & train classification model')
    parser.add_argument('-d', '--dataset', help='Path to the dataset', type=str, required=False, default=None)
    parser.add_argument('-t', '--type', help='Type of labels to train on', type=str, required=True, choices=['nature', 'matiere_1', 'matiere_2'])
    parser.add_argument('-c', '--config', help='Path to the config yaml file', type=str, required=False, default='../../config/ConfigClassifier.yaml')
    parser.add_argument('-s', '--save', help='Path where to save the training', type=str, required=False, default=None)
    args = parser.parse_args()
        
    logging.info('Read dataset')
    try:
        dataset = data.Data()
        dataset.df = pd.read_pickle(args.dataset)
    except FileNotFoundError:
        logging.error(f'No dataset found at {args.dataset}')
        sys.exit()
        
    # Create main directory
    if args.save is not None:
        if os.path.exists(args.save):
            shutil.rmtree(args.save)
        os.mkdir(args.save)
        model_dir = os.path.join(args.save, 'models')
        os.mkdir(model_dir)
    
    if args.type == 'nature':
        dataset.df = dataset.df.dropna(subset=['nature'])
        dataset.df = dataset.df[dataset.df['nature'].isin(['1', '2', '3', '4'])]
    elif args.type == 'matiere_1':
        dataset.df = dataset.df.dropna(subset=['matiere_1'])
        dataset.df = dataset.df[dataset.df['matiere_1'].isin(['1', '2', '3', '4', '5', '6', '7'])]
    elif args.type == 'matiere_2':
        dataset.df = dataset.df.dropna(subset=['matiere_2'])
        # Matieres prioritaires
        dataset.df = dataset.df[dataset.df['matiere_2'].isin(['1.1', '1.2', '1.3', '3.1', '3.2', '3.3', '4.1', '4.2', '4.5', '5.3', '5.4', '5.5', '7.2', '7.3', '7.5', '7.7', '8.3'])]
    
    if 'split' not in dataset.df.columns:
        dataset.split_data(r=[0.8, 0.2])
    if 'preprocessed_text' not in dataset.df.columns:
        dataset.preprocess(stemming=False, col_df='texte')
        
    if args.save is not None:
        dataset.save_data(os.path.join(args.save, f'{args.type}_dataset.pkl'))
        
    X_train, y_train = dataset.get_x_y_set('preprocessed_text', args.type, split='TRAIN')
    X_test, y_test = dataset.get_x_y_set('preprocessed_text', args.type, split='TEST')
    
    # Load parameters from config file
    with open(args.config, 'r') as f:
        dictionary = yaml.load(f, Loader=yaml.FullLoader)
        parameters_vectorizer = list(product_dict(**dictionary['bow']))
        parameters_model = list(product_dict(**dictionary['xgb']))

    # Train with each set of parameters
    results = []
    for i, param_model in enumerate(parameters_model):
        for j, param_vector in enumerate(parameters_vectorizer):
            logging.info('-- PARAMETERS VECTORIZER > ' + ' '.join(f'{k}: {v}' for k, v in param_vector.items()) + ' --')
            logging.info('-- PARAMETERS MODEL > ' + ' '.join(f'{k}: {v}' for k, v in param_model.items()) + ' --')
            
            model = xgb.XGBClassifier(objective="multi:softprob", **param_model)
            vectorizer = CountVectorizer(**param_vector)
            clf = classifier.Classifier(model, vectorizer)
            clf.train(X_train, y_train)
            score = clf.test(X_test, y_test)
            avg_score = score['weighted avg']
            logging.info(f'p : {round(avg_score["precision"]*100, 2)}, r : {round(avg_score["recall"]*100, 2)}, s : {avg_score["support"]}')
            
            if args.save is not None:
                model_path = os.path.join(model_dir, f'id_{i}{j}_{args.type}.model')
                label_keys, label_values = label_scores(score)
                results.append([*param_vector.values(), *param_model.values(), round(avg_score['precision']*100, 2), round(avg_score['recall']*100, 2), len(X_train), avg_score['support'], model_path, *label_values])
                clf.save_model(model_path)
            
                result_path = os.path.join(args.save, os.path.basename(args.save) + '.xlsx')
                if os.path.exists(result_path):
                    os.remove(result_path)
                    
                df = pd.DataFrame(results, columns=[*param_vector.keys(), *param_model.keys(), 'precision', 'recall', 'train_support', 'test_support', 'model_name', *label_keys])
                writer = pd.ExcelWriter(result_path, engine = 'openpyxl')
                df.to_excel(writer)
                writer.save()