"""
Manually equilibrate the data in the annotation app
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
"dw_actes_clean"
"test_annotations"
"app_annotation"
3000
0.7
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


# copy annotations table
with engine.connect() as con:    
    con.execute("""
        CREATE TABLE app_annotation_20201002
        (LIKE app_annotation including all);
        """)     
with engine.connect() as con:    
    con.execute("""
INSERT INTO app_annotation_20201002
(SELECT * FROM app_annotation);
""")

# copy data table
with engine.connect() as con:    
    con.execute("""
        CREATE TABLE test_annotations_20201002
        (LIKE test_annotations including all);
        """)     
with engine.connect() as con:    
    con.execute("""
INSERT INTO test_annotations_20201002
(SELECT * FROM test_annotations);
""")

####################################
# add new data to test_annotations #
####################################
sql_column_select = """noacte, filename, t_natureacte_codenature as nature, t_matiere_codematiere as matiere, 
         objetacte, extracted_text as texte, pj_acte_principal, t_site_nodepartement as dept, iddocument, 
         is_recrutement, is_avenant
"""
         
# objet "recrutement"
sql_select_recrutement = """
(SELECT {} FROM dw_actes_clean 
WHERE pj_acte_principal IS NULL AND is_recrutement=true AND t_natureacte_codenature IN ('3') 
    AND concat(split_part(t_matiere_codematiere, '.', 1), '.', split_part(t_matiere_codematiere, '.', 2))='4.2'
    AND filename NOT IN (SELECT DISTINCT filename FROM test_annotations)
ORDER BY RANDOM()
LIMIT 300)
UNION
(SELECT {} FROM dw_actes_clean 
WHERE pj_acte_principal IS NULL AND is_recrutement=true AND t_natureacte_codenature IN ('4') 
    AND concat(split_part(t_matiere_codematiere, '.', 1), '.', split_part(t_matiere_codematiere, '.', 2))='4.2'
    AND filename NOT IN (SELECT DISTINCT filename FROM test_annotations)
ORDER BY RANDOM()
LIMIT 700)
""".format(sql_column_select, sql_column_select)
df_recrutement = pd.read_sql(sql_select_recrutement, con=engine)


# add pj and export
df_acte_2_annotate = df_recrutement.copy(deep=True)
list_filename_acte = list(df_acte_2_annotate['filename'].unique())
sql_query_pj = """
SELECT {} FROM dw_actes_clean WHERE pj_acte_principal IN {}
""".format(sql_column_select, str(list_filename_acte).replace('[', '(').replace(']', ')'))
df_pj = pd.read_sql(sql_query_pj, engine)
df_acte_2_annotate = pd.concat([df_acte_2_annotate, df_pj], ignore_index=True)

# post-process texte and objetacte fields
df_acte_2_annotate['texte'] = df_acte_2_annotate['texte'].str.strip(' \n\t\r').replace(regex=r'[\t\b\r ]*\n[\t\b\r ]*', value='\n').replace(regex=r'\n{2,}', value='\n\n')
df_acte_2_annotate['objetacte'] = df_acte_2_annotate['objetacte'].str.strip(' \n\t\r').replace(regex=r'[\t\b\r ]*\n[\t\b\r ]*', value='\n').replace(regex=r'\n{2,}', value='\n\n')
df_acte_2_annotate['statut'] = 0
df_acte_2_annotate['step'] = 0

# suffle before writting
df_acte_2_annotate = df_acte_2_annotate.sample(frac=1).reset_index(drop=True)

# write actes to annotate to database
df_acte_2_annotate.to_sql("test_annotations", engine, if_exists='append', index=False, chunksize=5000)
