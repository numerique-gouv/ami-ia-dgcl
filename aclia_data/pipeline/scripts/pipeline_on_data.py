import sys
sys.path.append('../../../actes-ia-data/pipeline')

import argparse
import pipeline, bdd
import logging

logging.basicConfig(format='%(asctime)s %(levelname)s:%(message)s', level = logging.INFO)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Load data & train NER model')
    parser.add_argument('-d', '--data', help='Path to the directory containing actes', type=str, required=True)
    parser.add_argument('-m', '--metadata', help='Path to the directory containing metadatas', type=str, required=True)
    parser.add_argument('-s', '--save', help='Path where to save the pipeline', type=str, required=False, default=None)
    parser.add_argument('-b', '--database', help='True to send the result to the database', type=bool, required=False, default=False)
    args = parser.parse_args()
    
    # Create pipeline object
    ppl = pipeline.Pipeline()
    ppl.add_data(args.data)
    ppl.add_metadata(args.metadata)

    # Save pipeline
    if args.save is not None:
        ppl.save_pipeline(args.save)
        
    df = ppl.get_full_table()

    if args.database:
        logging.info('Save to database')
        db = bdd.PostgreSQL_DB()
        db.save_table(df, 'dw_actes', if_exists='append')

    logging.info('---END---')