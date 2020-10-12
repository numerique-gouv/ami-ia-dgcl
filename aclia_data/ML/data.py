import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '../pipeline'))

import logging
import os

import numpy as np
import pandas as pd
from tqdm import tqdm

import bdd
import preprocessing

logging.basicConfig(format='%(asctime)s %(levelname)s:%(message)s', level = logging.INFO)

class Data:
    
    def __init__(self, filename=None):
        """
        :param filename: Path to a Data or pd.DataFrame object
        """
        self.df = None
        self.stopwords = None
        self.proper_nouns = None
        
        self._load_stopwords()
        
        tqdm.pandas()
        
        if filename is not None:
            self.load_data(filename)
          
    def _load_stopwords(self):
        self.stopwords = preprocessing.load_stopwords(os.path.join(os.path.dirname(__file__), 'rsc/stopwords/stopwords.txt'))
        villes = pd.read_csv(os.path.join(os.path.dirname(__file__), 'rsc/stopwords/villes_france.csv'), header=0, names=['dept', 'slug', 'nom', 'nom_simple', 'nom_reel', 'nom_soundex', 'nom_metaphone', 'code_postal', 'numero_commune', 'code_commune', 'arrondissement', 'arrondissement_bis', 'canton', 'pop_2010', 'pop_1999', 'pop_2012', 'densite_2010', 'superficie', 'long_deg', 'lat_deg', 'long_grd', 'lat_grd', 'long_dms', 'lat_dms', 'alt_min', 'alt_max'])
        villes = villes[villes['pop_2010'] > 2000]['nom_simple'].values
        communes_depts_regions = pd.read_csv(os.path.join(os.path.dirname(__file__), 'rsc/stopwords/communes-departement-region.csv'))
        depts = set(communes_depts_regions['nom_departement'].apply(lambda d : preprocessing.remove_accents(str(d).lower()).replace('-', ' ')).values)
        depts.remove('nan')
        regions = set(communes_depts_regions['nom_region'].apply(lambda r : preprocessing.remove_accents(str(r).lower()).replace('-', ' ')).values)
        regions.remove('nan')
        
        prenoms = pd.read_csv(os.path.join(os.path.dirname(__file__), 'rsc/stopwords/prenoms_2018.csv'), sep=';')
        # Remove XXXX 'annais'
        prenoms = prenoms[prenoms['annais'] != 'XXXX']
        # Sum nombre by name and sexe
        prenoms = prenoms.groupby(['preusuel', 'sexe']).sum().reset_index()
        # Keeps prenoms above 1000 occurencies
        prenoms = prenoms[prenoms['nombre'] > 1000]
        prenoms_list = set(prenoms['preusuel'].apply(lambda p : preprocessing.remove_accents(str(p).lower())).values)
        
        self.proper_nouns = [(list(villes), 'eville'), (list(depts), 'edepartement'), (list(regions), 'eregion'), (list(prenoms_list), 'eprenom')]
        
    def preprocess(self, stemming=False, col_df='extracted_text', new_col_df='preprocessed_text'):
        """Preprocess text from column col_df and save it in new_col_df

        :param stemming: Enable stemming
        :param col_df: Column with the text to preprocess
        :param new_col_df: Column where to save the preprocessed text
        """
        tqdm.pandas()

        if self.df is None:
            logging.error('Dataframe is empty')
            return
        
        self.df[new_col_df] = self.df[col_df].progress_apply(lambda text : preprocessing.preprocessing(text, stemming=stemming, stopwords=self.stopwords, proper_nouns_sw=self.proper_nouns))
        
    def save_data(self, filename):
        """Save Data object

        :param filename: Path and name of the saved object
        """
        self.df.to_pickle(filename)
    
    @staticmethod
    def load_data(filename):
        """Load a saved Data object

        :param filename: Path and name of the saved object
        """
        data = Data()
        
        if not os.path.exists(filename):
            logging.warning(f'Not a valid path : \'{filename}\'')
            return
        
        data.df = pd.read_pickle(filename)
        return data
            
    def split_data(self, r=[0.8, 0.2], seed=0):
        """Split the dataframe into TRAIN, TEST and/or VALID sets

        :param r: list of 2 or 3 numbers for the splits
        :param seed: set a value for the seed
        """
        np.random.seed(seed)
        splits = ['TRAIN', 'TEST', 'VALID'][:len(r)]

        self.df['split'] = np.random.choice(splits, len(self.df), p=r)
        
        for s in splits:
            split_len = len(self.df[self.df['split'] == s])
            logging.info(f'{s} files : {split_len} ({split_len*100/len(self.df):.2f}%)')
        
    def get_set(self, split='train'):
        """Get a specific set

        :param split: 'train', 'test', 'valid' or 'all'
        """
        if split == 'all':
            return self.df
        
        if 'split' not in self.df.columns:
            logging.error('Dataframe must be split first')
            return None
        
        dataset = self.df[self.df['split'] == split.upper()]
        
        return dataset
    
    def get_x_y_set(self, x_col, y_col, split='train'):
        """Get two columns for a specific set

        :param x_col: Name for the x column
        :param y_col: Name for the y column
        :param split: 'train', 'test', 'valid' or 'all'
        """
        dataset = self.get_set(split=split)
        
        return (dataset[x_col], dataset[y_col])
        
    def import_from_db(self, count, table_name):
        """Import rows from a database

        :param count: Number of rows to import
        :param table_name: Name of the table
        """
        db = bdd.PostgreSQL_DB()
        
        self.df = db.get_table(f'SELECT * FROM {table_name} LIMIT {count}')
        
    def clean_dataframe(self, label, matiere_nv_1=None):
        """clean dataframe depending on the label

        :param label: label among the list ('nature', 'matiere_1')
        :param matiere_nv_1: If a specific "niveau 1" is needed, choose it among the list ('1', '2', '3', '4', '5', '6', '7')
        """
        list_labels = {'nature':('1', '2', '3', '4'),
 	       'matiere_1':('1', '2', '3', '4', '5', '6', '7'),
 	       '1':('1', '2', '3', '4', '5', '6', '7'),
 	       '2':('1', '2', '3'),
 	       '3':('1', '2', '3', '4', '5', '6'),
           '4':('1', '2', '3', '4', '5'),
           '5':('1', '2', '3', '4', '5', '6', '7', '8'),
           '6':('1', '2', '3', '4', '5'),
           '7':('1', '2', '3', '4', '5', '6', '7', '8', '9', '10')}
        
        self.df = self.df.rename({'t_natureacte_codenature':'nature', 't_matiere_codematiere':'matiere'})
        self.df['matiere_1'] = self.df['matiere'].apply(lambda matiere : matiere.split('.')[0])
        self.df['matiere_2'] = self.df['matiere'].apply(lambda matiere : matiere.split('.')[1] if len(matiere) > 1 else None)
        self.df = self.df.dropna(subset=['extracted_text', label])
        
        self.df = self.df[self.df[label].isin(list_labels[label])]
        
        if matiere_nv_1 is not None and label == 'matiere_1':
            self.df = self.df[self.df['matiere_1'] == matiere_nv_1]
            self.df = self.df.dropna(subset=['matiere_2'])
            self.df = self.df[self.df['matiere_2'].isin(list_labels[matiere_nv_1])]
        
        self.df = self.df[self.df['pj_acte_principal'].isnull()]