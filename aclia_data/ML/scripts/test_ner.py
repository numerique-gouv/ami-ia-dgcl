import sys
sys.path.append('../../../actes-ia-data/ML')
sys.path.append('../../../actes-ia-data/pipeline')

import argparse
import logging
import os
import pickle
import sys

import pandas as pd

import NER

logging.basicConfig(format='%(asctime)s %(levelname)s:%(message)s', level = logging.INFO)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Load data & train NER model')
    parser.add_argument('-d', '--dataset', help='Path to the NER annotations', type=str, required=True)
    parser.add_argument('-s', '--save', help='Path where to save the training', type=str, required=False, default=None)
    parser.add_argument('-m', '--model', help='Path to the trained model', type=str, required=True)
    args = parser.parse_args()
    
    logging.info('Read dataset')
    try:
        annotations = pickle.load( open(args.dataset, "rb" ) )
    except:
        logging.error(f'No dataset found at {args.dataset}')
        sys.exit()
        
    nature = os.path.basename(args.dataset).split('.')[0].split('_')[-1]
        
    ner = NER.NER.load_model(args.model)
    
    score = ner.test_fuzzy_match(annotations, 50)
    total_score = score['total_score']
    score.pop('total_score')
    logging.info(f'Nature : {nature}, p : {total_score["precision"]}, r : {total_score["recall"]}, s : {total_score["support"]}')
    
    if args.save is not None:
        results = [[total_score['precision'], total_score['recall'], total_score['support'], nature, args.model, score]]
    
        if os.path.exists(args.save):
            os.remove(args.save)
            
        df = pd.DataFrame(results, columns=['precision', 'recall', 'test_support', 'nature', 'model_name', 'label_scores'])
        writer = pd.ExcelWriter(args.save, engine = 'openpyxl')
        df.to_excel(writer)
        writer.save()
    