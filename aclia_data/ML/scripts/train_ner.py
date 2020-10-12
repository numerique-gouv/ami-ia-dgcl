import sys
sys.path.append('../../../actes-ia-data/ML')
sys.path.append('../../../actes-ia-data/pipeline')

import argparse
import logging
import os
import pickle
import random
import shutil
import sys
from itertools import product

import pandas as pd
import yaml

import NER

logging.basicConfig(format='%(asctime)s %(levelname)s:%(message)s', level = logging.INFO)

def product_dict(**kwargs):
    """Cartesian product of lists with their corresponding dictionary keys
    
    """
    keys = kwargs.keys()
    vals = kwargs.values()
    for instance in product(*vals):
        yield dict(zip(keys, instance))
        
def split_data(annotations, train_ratio=0.8):
    """Split data into train set and validation set
    
    :param annotations: List of annotations to split
    :param train_ratio: train ratio for the split (between 0 and 1)
    """
    random.shuffle(annotations)
    train_data = annotations[0:int(train_ratio*len(annotations))]
    test_data = annotations[int(train_ratio*len(annotations)):]
    
    return (train_data, test_data)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Load data & train NER model')
    parser.add_argument('-d', '--dataset', help='Path to the dataset with NER annotations', type=str, required=True)
    parser.add_argument('-t', '--type', help='Type of labels to train on', type=str, required=True, choices=['corps', 'objet'])
    parser.add_argument('-c', '--config', help='Path to the config yaml file', type=str, required=False, default='../../config/ConfigNER.yaml')
    parser.add_argument('-s', '--save', help='Path where to save the training', type=str, required=False, default=None)
    args = parser.parse_args()
    
    logging.info('Read dataset')
    try:
        annotations_df = pd.read_pickle(args.dataset)
    except:
        logging.error(f'No dataset found at {args.dataset}')
        sys.exit()
        
    # Create main directory
    if args.save is not None:
        if os.path.exists(args.save):
            shutil.rmtree(args.save)
        os.mkdir(args.save)
    
    # Format dataset and create folders if save=True
    logging.info('Format dataset')
    annotations = {}
    
    for nature in ['DE', 'AR', 'AI', 'CC']:
        if args.type == 'corps':
            annotations_format = NER.NER.format_metadata_corps(annotations_df[annotations_df['nature_label'] == nature].dropna(subset=['corps']), only_objet=True)
        elif args.type == 'objet':
            annotations_format = NER.NER.format_metadata_objet(annotations_df[annotations_df['nature_label'] == nature].dropna(subset=['metaObjet']))
        annotations[nature] = split_data(annotations_format)
        logging.info(f'Nature : {nature}, actes : {len(annotations[nature][0]) + len(annotations[nature][1])}')
        
        if args.save is not None:
            nature_dir = os.path.join(args.save, nature)
            os.mkdir(nature_dir)
            os.mkdir(os.path.join(nature_dir, 'models'))
            
            with open(os.path.join(*[args.save, nature, f'train_data_{nature}.pkl']), "wb") as fp:
                pickle.dump(annotations[nature][0], fp)
            with open(os.path.join(*[args.save, nature, f'test_data_{nature}.pkl']), "wb") as fp:
                pickle.dump(annotations[nature][1], fp)
    
    ner = NER.NER()
    
    # Load parameters from config file
    with open(args.config, 'r') as f:
        dictionary = yaml.load(f, Loader=yaml.FullLoader)['hyperparameters']
        parameters = product_dict(**dictionary)
        
    
    # Train with each set of parameters
    results = []
    for i, parameter in enumerate(parameters):
        logging.info('-- PARAMETERS > ' + ' '.join(f'{k}: {v}' for k, v in parameter.items()) + ' --')
        for nature in ['DE', 'AR', 'AI', 'CC']:
            (train_data, test_data) = annotations[nature]
            ner.train(train_data, **parameter)
            train_support = ner.test_fuzzy_match(train_data, 50)['total_score']['support']
            score = ner.test_fuzzy_match(test_data, 50)
            total_score = score['total_score']
            score.pop('total_score')
            logging.info(f'Nature : {nature}, p : {total_score["precision"]}, r : {total_score["recall"]}, s : {total_score["support"]}')
            
            if args.save is not None:
                model_path = os.path.join(*[args.save, nature, 'models', f'id_{i}_{args.type}_{nature}.model'])
                results.append([*parameter.values(), total_score['precision'], total_score['recall'], train_support, total_score['support'], nature, model_path, score])
                ner.save_model(model_path)
            
                result_path = os.path.join(args.save, 'results.xlsx')
                if os.path.exists(result_path):
                    os.remove(result_path)
                    
                df = pd.DataFrame(results, columns=[*parameter.keys(), 'precision', 'recall', 'train_support', 'test_support', 'nature', 'model_name', 'label_scores'])
                writer = pd.ExcelWriter(result_path, engine = 'openpyxl')
                df.to_excel(writer)
                writer.save()
        
        