#!/usr/bin/env python 
#-*- coding: utf-8 -*-

'''
Set the statut to 0 and step to 0 in the acte table pluged to the annotation webapp when no annotations
'''

from sqlalchemy import create_engine
import os
import configparser
from sqlalchemy import create_engine
import datetime as dt

##########
# params #
db_app_actes_tab = "test_annotations"
db_app_annotation_tab = "app_annotation"
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

with engine.connect() as con:
	con.execute("""
	UPDATE {} SET statut=0, step=0
	WHERE noacte NOT IN (SELECT noacte from {}) AND statut>0
	""".format(db_app_actes_tab, db_app_annotation_tab))	

print(dt.datetime.now().strftime("%y-%m-%d %H:%M"))
print("Execution performed!")
