#!/usr/bin/env python 
#-*- coding: utf-8 -*-

"""
Count annotations by user and count annotations by steps. Export to Excel
"""

from sqlalchemy import create_engine
from openpyxl import load_workbook
from openpyxl import Workbook
import pandas as pd
import os
from pathlib import Path
import configparser
import datetime as dt

##########
# params #
db_app_annotation_tab = "app_annotation"
db_app_actes_tab = "test_annotations"
dict_anno_stats_file = {'file_path': "C:/Users/assuondojo/Documents/projects/ms_09/DGCL/data/annnotation_app/stats_annotations_" + dt.datetime.now().strftime("%Y_%m_%d") + ".xlsx",
                        'sheet_anno_by_user': 'nb_anno_par_utilisateur',
                        'sheet_anno_by_step': 'nb_anno_par_etape_arrivee',
                        'sheet_list_anno_incompletes': 'liste_anno_incompletes',
                        'sheet_anno_by_transmslt': 'nb_anno_par_transmissibilite',
                        'sheet_anno_by_nature': 'nb_anno_par_nature',
                        'sheet_anno_by_matiere_1': 'nb_anno_par_matiere_1',
                        'sheet_anno_by_matiere_2': 'nb_anno_par_matiere_2',
                        'sheet_anno_by_meta_objet_concept': 'nb_anno_par_meta_objet_concept',
                        'sheet_anno_by_corps_concept': 'nb_anno_par_corps_concept',
                        'sheet_anno_by_nature_pj': 'nb_anno_par_type_pj'}
##############
# end params #
##############

#connexion to BDD
config = configparser.ConfigParser()
conf_file_path = os.path.join(os.path.dirname(__file__), '../config/ConfigSQL.cfg')
#conf_file_path = 'C:/Users/assuondojo/Documents/projects/ms_09/DGCL/actes-ia-data/config/ConfigSQL.cfg'
config.read(conf_file_path)
PG_ACCESS_USER = config.get('postgresql', 'PG_ACCESS_USER')
PG_ACCESS_PASS = config.get('postgresql', 'PG_ACCESS_PASS')
PG_ACCESS_HOST = config.get('postgresql', 'PG_ACCESS_HOST')
PG_ACCESS_PORT = config.get('postgresql', 'PG_ACCESS_PORT')
PG_ACCESS_DBNAME = config.get('postgresql', 'PG_ACCESS_DBNAME')
PG_ACCESS_URL = (
    'postgresql+psycopg2://'
    + PG_ACCESS_USER + ':' + PG_ACCESS_PASS
    + '@' + PG_ACCESS_HOST + ':' + PG_ACCESS_PORT
    + '/' + PG_ACCESS_DBNAME
)
engine = create_engine(PG_ACCESS_URL)
# connexion to BDD

#####################################################
# 1 - Get nb annotations among dimensions user, step
#####################################################

print("""
#####################################################
# 1 - Get nb annotations among dimensions user, step
#####################################################
""")

sql_query = """
SELECT username, count(filename) AS nb_actes
FROM {}  WHERE username<>'starclay' group by username
""".format(db_app_annotation_tab)
df_anno_by_user = pd.read_sql(sql_query, engine).reset_index(drop=True)

sql_query = """
    SELECT t1.iddocument, t1.filename as nom_acte, step as etape, date, username, qcm FROM {} AS t1
LEFT JOIN 
    (SELECT filename, step FROM {} 
     WHERE pj_acte_principal IS NULL) AS t2
ON t1.filename=t2.filename
WHERE username<>'starclay'
""".format(db_app_annotation_tab, db_app_actes_tab)
df_anno = pd.read_sql(sql_query, engine).reset_index(drop=True)
df_anno['etape_libelle'] = df_anno['etape'].map({1:'1-transmissibilité', 2:'2-nature', 3:'3-matières_1_2', 4:'4-méta-Objet', 5:'5-Corps', 6:'6-pj'})
df_anno['transmissible'] = df_anno['qcm'].apply(lambda x:x['isTransmissible'])

df_anno_by_transmisblt = df_anno['transmissible'].value_counts(dropna=False).rename_axis('transmissible').reset_index(name='nb_actes_annotes') 

series_value_counts = df_anno['etape_libelle'].value_counts(dropna=False)
df_anno_by_step = pd.DataFrame({'etape_libelle':series_value_counts.index, 'nb_actes':list(series_value_counts)})

list_columns_incomplete_anno = ['iddocument', 'nom_acte', 'transmissible', 'etape', 'etape_libelle', 'date', 'username']
df_list_anno_incompletes = df_anno.loc[(df_anno['etape']<5) & (df_anno['transmissible']==True), list_columns_incomplete_anno]

print(dt.datetime.now().strftime("%Y-%m-%d %H:%M"))

#####################################################
# 2 - Get nb annotations by annotated concepts
#####################################################
print("""
#####################################################
# 2 - Get nb annotations by annotated concepts
#####################################################
""")
def get_value_from_dict(dict_anno, key):
    try :
        return dict_anno[key]
    except:
        return None
df_anno['nature'] = df_anno['qcm'].apply(lambda x: get_value_from_dict(x, 'nature_label'))
df_anno_by_nature = df_anno['nature'].value_counts(dropna=False).rename_axis('nature').reset_index(name='nb_actes_annotes')

df_anno['matiere_1'] = df_anno['qcm'].apply(lambda x: get_value_from_dict(x, 'matiere_1'))
df_anno_by_matiere_1 = df_anno['matiere_1'].value_counts(dropna=False).rename_axis('matiere_1').reset_index(name='nb_actes_annotes')

df_anno['matiere_2'] = df_anno['qcm'].apply(lambda x: get_value_from_dict(x, 'matiere_2'))
df_anno_by_matiere_2 = df_anno['matiere_2'].value_counts(dropna=False).rename_axis('matiere_2').reset_index(name='nb_actes_annotes')

def get_list_concepts_from_meta_objet(dict_anno):
    try :
        list_concept = []
        nature = dict_anno['nature_label']
        for elt in dict_anno['metaObjet']:
            concept = nature + "_" + elt['categorie']
            list_concept.append(concept)
        return list_concept
    except:
        return []
df_anno['meta_objet_concept'] = df_anno['qcm'].apply(lambda x: get_list_concepts_from_meta_objet(x))
df_anno_by_meta_objet = df_anno['meta_objet_concept'].apply(lambda x: pd.Series(x).value_counts(dropna=False)).sum().sort_values(ascending=False).astype('int')
df_anno_by_meta_objet = df_anno_by_meta_objet.rename_axis('meta_objet_concept').reset_index(name='nb_anno')

def get_list_concepts_from_corps(dict_anno):
    try :
        list_concept = []
        nature = dict_anno['nature_label']
        for elt in dict_anno['corps']:
            concept = nature + "_" + elt['concept']
            sous_concept = elt['underConcept']
            concept_sous_concept = concept if sous_concept==None else concept + '_' + sous_concept
            list_concept.append(concept_sous_concept)
        return list_concept
    except:
        return []
df_anno['corps_concept'] = df_anno['qcm'].apply(lambda x: get_list_concepts_from_corps(x))
df_anno_by_corps = df_anno['corps_concept'].apply(lambda x: pd.Series(x).value_counts(dropna=False)).sum().sort_values(ascending=False).astype('int')
df_anno_by_corps = df_anno_by_corps.rename_axis('corps_concept').reset_index(name='nb_anno')

def get_list_concepts_from_pj(dict_anno):
    try :
        list_concept = []
        for elt in dict_anno['pj']:
            concept = elt['type']
            list_concept.append(concept)
        return list_concept
    except:
        return []
df_anno['pj_concept'] = df_anno['qcm'].apply(lambda x: get_list_concepts_from_pj(x))
df_anno_by_type_pj = df_anno['pj_concept'].apply(lambda x: pd.Series(x).value_counts(dropna=False)).sum().sort_values(ascending=False).astype('int')
df_anno_by_type_pj = df_anno_by_type_pj.rename_axis('pj_concept').reset_index(name='nb_anno')

##############
# 3 - Exports
##############
print("""
##############
# 3 - Exports
##############
""")
if not Path(dict_anno_stats_file['file_path']).exists():
    pd.DataFrame().to_excel(dict_anno_stats_file['file_path'], dict_anno_stats_file['sheet_anno_by_user']) # create empty xlsx file if not existing
book = load_workbook(dict_anno_stats_file['file_path'])
writer = pd.ExcelWriter(dict_anno_stats_file['file_path'], engine = 'openpyxl')
writer.book = book

def export_to_excel(df, excel_writer, sheet_name):
    try:
        std = book.get_sheet_by_name(sheet_name)
        book.remove_sheet(std)
    except:
        pass
    df.to_excel(excel_writer, sheet_name = sheet_name, index=False)
    
# export anno by user, by step and incomplete
export_to_excel(df_anno_by_user, writer, dict_anno_stats_file['sheet_anno_by_user'])
export_to_excel(df_anno_by_step, writer, dict_anno_stats_file['sheet_anno_by_step'])
export_to_excel(df_list_anno_incompletes, writer, dict_anno_stats_file['sheet_list_anno_incompletes'])

# export nb anno by annotated concepts
export_to_excel(df_anno_by_transmisblt, writer, dict_anno_stats_file['sheet_anno_by_transmslt'])
export_to_excel(df_anno_by_nature, writer, dict_anno_stats_file['sheet_anno_by_nature'])
export_to_excel(df_anno_by_matiere_1, writer, dict_anno_stats_file['sheet_anno_by_matiere_1'])
export_to_excel(df_anno_by_matiere_2, writer, dict_anno_stats_file['sheet_anno_by_matiere_2'])
export_to_excel(df_anno_by_meta_objet, writer, dict_anno_stats_file['sheet_anno_by_meta_objet_concept'])
export_to_excel(df_anno_by_corps, writer, dict_anno_stats_file['sheet_anno_by_corps_concept'])
export_to_excel(df_anno_by_type_pj, writer, dict_anno_stats_file['sheet_anno_by_nature_pj'])

writer.save()
writer.close()


print(dt.datetime.now().strftime("%Y-%m-%d %H:%M"))
print("Execution performed!")