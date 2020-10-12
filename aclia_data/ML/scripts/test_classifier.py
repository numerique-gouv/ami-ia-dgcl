import sys
sys.path.append('../../../actes-ia-data/ML')

import argparse
import shutil
import os
import sys
import logging
import warnings
import pandas as pd
import data
import classifier

warnings.filterwarnings("ignore")
logging.basicConfig(format='%(asctime)s %(levelname)s:%(message)s', level = logging.INFO)

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
    parser.add_argument('-d', '--dataset', help='Path to the dataset', type=str, required=True)
    parser.add_argument('-t', '--type', help='Type of labels to train on', type=str, required=True, choices=['nature', 'matiere_1', 'matiere_2'])
    parser.add_argument('-m', '--model', help='Path to the trained model', type=str, required=True)
    parser.add_argument('-s', '--save', help='Path where to save the score file', type=str, required=True)
    args = parser.parse_args()
    
    logging.info('Read dataset')
    try:
        dataset = data.Data()
        dataset.df = pd.read_pickle(args.dataset)
    except FileNotFoundError:
        logging.error(f'No dataset found at {args.dataset}')
        sys.exit()
        
    # Clean dataset
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
    
    clf = classifier.Classifier.load_model(args.model)
    X, y = dataset.get_x_y_set('preprocessed_text', args.type, split='TEST')
    score = clf.test(X, y)
    avg_score = score['weighted avg']
    logging.info(f'p : {round(avg_score["precision"]*100, 2)}, r : {round(avg_score["recall"]*100, 2)}, s : {avg_score["support"]}')
        
    label_keys, label_values = label_scores(score)

    if os.path.exists(args.save):
        os.remove(args.save)
        
    results = [[round(avg_score['precision']*100, 2), round(avg_score['recall']*100, 2), len(X), avg_score['support'], args.model, *label_values]]
    df = pd.DataFrame(results, columns=['precision', 'recall', 'train_support', 'test_support', 'model_name', *label_keys])
    writer = pd.ExcelWriter(args.save, engine = 'openpyxl')
    df.to_excel(writer)
    writer.save()