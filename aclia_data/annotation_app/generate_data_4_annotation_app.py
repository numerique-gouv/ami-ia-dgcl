"""
Generate data for annotation app according to matieres to prioritize
Evolution à venir, ne pas inclure les actes déjà annotés
"""

import pandas as pd
import numpy as np
import os
import configparser
from sqlalchemy import create_engine
import datetime as dt

##########
# params #
##########
file_matieres_2_prioritize = os.path.join(os.path.dirname(__file__), 'matieres_prioritaires_20200731.xlsx')
#file_matieres_2_prioritize = 'C:/Users/assuondojo/Documents/projects/ms_09/DGCL/actes-ia-data/annotation_app/matieres_prioritaires_20200731.xlsx'
actes_tab = "dw_actes_clean"
actes_2_annotate_tab = "test_annotations"
annotations_tab = "app_annotation"
nb_row_annotation_tab = 3000
ratio_matieres_prioritized = 0.7
##########
# params #
##########

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

# import matiere to prioritize
list_matiere_prioritized = list(pd.read_excel(file_matieres_2_prioritize, 
                                              dtype={'code_matiere':str})['code_matiere'].unique())
print("""Prioritized matieres:
      {}
      """.format(list_matiere_prioritized))

# generate data with prioritized matiere
nb_row_max_by_matiere = int(nb_row_annotation_tab*ratio_matieres_prioritized/len(list_matiere_prioritized))
print("\n",dt.datetime.now().strftime("%Y-%m-%d %H:%M"))
print("""# generate data with prioritized matiere
      nb matières : {}
      nb_row_max_by_matiere max: {}
      """.format(len(list_matiere_prioritized), nb_row_max_by_matiere))
list_sql_query = []
sql_column_select = """noacte, filename, t_natureacte_codenature as nature, t_matiere_codematiere as matiere, 
         objetacte, extracted_text as texte, pj_acte_principal, t_site_nodepartement as dept, iddocument, 
         is_recrutement, is_avenant
"""
for matiere in list_matiere_prioritized:
    sql_select_current = """
        (SELECT {}
        FROM {}
        WHERE pj_acte_principal IS NULL 
            AND concat(split_part(t_matiere_codematiere, '.', 1), '.', split_part(t_matiere_codematiere, '.', 2)) = '{}'
        ORDER BY RANDOM()
        LIMIT {})
    """.format(sql_column_select, actes_tab, matiere, nb_row_max_by_matiere)
    list_sql_query.append(sql_select_current)
sql_query_final = " UNION ".join(list_sql_query)
df_data_matiere_prioritized = pd.read_sql(sql_query_final, con=engine)
print("  nb generated data :", df_data_matiere_prioritized.shape[0])

# generate data not prioritized matiere
print("\n",dt.datetime.now().strftime("%Y-%m-%d %H:%M"))
print("# generate data not prioritized matiere")
nb_max_row_other_matieres = nb_row_annotation_tab - df_data_matiere_prioritized.shape[0]
sql_query = """
    SELECT {}
    FROM {}
    WHERE concat(split_part(t_matiere_codematiere, '.', 1), '.', split_part(t_matiere_codematiere, '.', 2)) NOT IN {}
    AND pj_acte_principal IS NULL
    ORDER BY RANDOM()
    LIMIT {}
""".format(sql_column_select, actes_tab, str(list_matiere_prioritized).replace('[', '(').replace(']', ')'), nb_max_row_other_matieres)
df_data_matiere_other = pd.read_sql(sql_query, engine)
print("   nb generated data :", df_data_matiere_other.shape[0])

# concatenate the two table
print("\n",dt.datetime.now().strftime("%Y-%m-%d %H:%M"))
print("# concatenate the two table")
df_acte_2_annotate = pd.concat([df_data_matiere_prioritized, df_data_matiere_other], ignore_index=True)

# get pj files and append them
print("\n", dt.datetime.now().strftime("%Y-%m-%d %H:%M"))
print("# get pj files and append them")
list_filename_acte = list(df_acte_2_annotate['filename'].unique())
sql_query_pj = """
    SELECT {}
    FROM {}
    WHERE pj_acte_principal IN {}
""".format(sql_column_select, actes_tab, str(list_filename_acte).replace('[', '(').replace(']', ')'))
df_pj = pd.read_sql(sql_query_pj, engine)
df_acte_2_annotate = pd.concat([df_acte_2_annotate, df_pj], ignore_index=True)

# post-process texte and objetacte fields
df_acte_2_annotate['texte'] = df_acte_2_annotate['texte'].str.strip(' \n\t\r').replace(regex=r'[\t\b\r ]*\n[\t\b\r ]*', value='\n').replace(regex=r'\n{2,}', value='\n\n')
df_acte_2_annotate['objetacte'] = df_acte_2_annotate['objetacte'].str.strip(' \n\t\r').replace(regex=r'[\t\b\r ]*\n[\t\b\r ]*', value='\n').replace(regex=r'\n{2,}', value='\n\n')

# add 2 new columns for annotation
df_acte_2_annotate['statut'] = 0
df_acte_2_annotate['step'] = 0

# suffle before writting
df_acte_2_annotate = df_acte_2_annotate.sample(frac=1).reset_index(drop=True)

# rename old generated table
str_datetime_now = dt.datetime.now().strftime("%Y%m%d%H%M")
actes_2_annotate_tab_old = actes_2_annotate_tab+'_'+str_datetime_now
annotations_tab_old = annotations_tab+'_'+str_datetime_now
with engine.connect() as con:
	con.execute("""
    ALTER TABLE IF EXISTS {}
    RENAME TO {};
	""".format(actes_2_annotate_tab, actes_2_annotate_tab_old))
with engine.connect() as con:    
    con.execute("""
    ALTER TABLE IF EXISTS {}
    RENAME TO {};
    	""".format(annotations_tab, annotations_tab_old))

# write actes to annotate to database
df_acte_2_annotate.to_sql(actes_2_annotate_tab, engine, if_exists='replace', index=False, chunksize=5000)

# create empty annotations table
with engine.connect() as con:    
    con.execute("""
    CREATE TABLE {}
    (LIKE {} including all);
    	""".format(annotations_tab, annotations_tab_old))
