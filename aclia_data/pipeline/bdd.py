"""
bdd.py
====================================
Module to manage PostgreSQL database
"""

import configparser
import datetime as dt
import logging
import os
import smtplib
import sys
import traceback
from ast import literal_eval
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import pandas as pd
from sqlalchemy import MetaData, create_engine
from sqlalchemy.ext.declarative import declarative_base


class PostgreSQL_DB:
    def __init__(self, enable_mail=True):
        """
        :param enable_mail: Will send mail when an error occurs
        """
        # sql postgresql
        config = configparser.ConfigParser()
        conf_file_path = os.path.join(os.path.dirname(__file__), "../config/ConfigSQL.cfg")
        config.read(conf_file_path)

        PG_ACCESS_USER = config.get("postgresql", "PG_ACCESS_USER")
        PG_ACCESS_PASS = config.get("postgresql", "PG_ACCESS_PASS")
        PG_ACCESS_HOST = config.get("postgresql", "PG_ACCESS_HOST")
        PG_ACCESS_PORT = config.get("postgresql", "PG_ACCESS_PORT")
        PG_ACCESS_DBNAME = config.get("postgresql", "PG_ACCESS_DBNAME")
        PG_ACCESS_URL = (
            "postgresql+psycopg2://"
            + PG_ACCESS_USER
            + ":"
            + PG_ACCESS_PASS
            + "@"
            + PG_ACCESS_HOST
            + ":"
            + PG_ACCESS_PORT
            + "/"
            + PG_ACCESS_DBNAME
        )

        self.engine = create_engine(PG_ACCESS_URL)

        self.email_infos = {
            "sender": config.get("email_infos", "sender"),
            "receivers": literal_eval(config.get("email_infos", "receivers")),
            "server": config.get("email_infos", "server"),
        }

        self.enable_mail = enable_mail

    def save_table(self, df, table_name, if_exists="replace"):
        """Save table to postgreSQL database

        :param df: Dataframe to save
        :param table_name: Name for the table in the database
        :param if_exists: 'replace' to replace the table or 'append' to append to the existing table
        :returns: True if the table was saved successfully, False otherwise
        """

        try:
            df.to_sql(
                table_name,
                con=self.engine,
                if_exists=if_exists,
                index=False,
                chunksize=60000,
            )
        except:
            error_traceback = traceback.format_exc()
            if self.enable_mail:
                self.send_error_data_by_mail(error_traceback)
            return False

        return True

    def get_table(self, sql_query):
        """Query the database and store it in a dataframe

        :param sql_query: Query in the database
        :returns: Dataframe containing the result of the query
        """

        try:
            df = pd.read_sql_query(sql_query, con=self.engine)
        except:
            error_traceback = traceback.format_exc()
            if self.enable_mail:
                self.send_error_data_by_mail(error_traceback)
            sys.exit(1)  # exit the execution

        return df

    def drop_table(self, table_name):
        """Drop a table from the database

        :param table_name: Name of the table to drop
        :returns: True if the table was successfully dropped, False otherwise
        """

        base = declarative_base()
        metadata = MetaData(self.engine, reflect=True)
        table = metadata.tables.get(table_name)
        if table is not None:
            logging.info(f"Deleting {table_name} table")
            try:
                base.metadata.drop_all(self.engine, [table], checkfirst=True)
            except:
                return False
        return True

    def send_error_data_by_mail(self, error_traceback):
        """Display the last error traceback and send alert email.

        :param email_infos: a dictionary like
        {'sender':sender@domain.com,
        'receivers':['receive1@domain.com', 'receive2@domain.com'],
        'server':'mail.part.net'}
        :param error_traceback: error traceback text
        """

        email_infos = self.email_infos

        now = dt.datetime.now()
        now_str = now.strftime("%Y-%m-%d %H:%M:%S")
        email_alert_subject = (
            "Application Actes IA - Extraction Actes - Erreur rencontrée " + now_str
        )
        email_alert_body = """Bonjour, 
        Une erreur est apparue dans l'exécution du traitement d'extraction des actes au moment de l'import des données.
        Nous sommes en train de la résoudre.

        Erreur rencontrée :
        ===================
        """
        email_alert_body = email_alert_body + error_traceback
        email = MIMEMultipart()
        email["From"] = email_infos["sender"]
        email["To"] = ", ".join(email_infos["receivers"])
        email["Subject"] = email_alert_subject
        email.attach(MIMEText(email_alert_body, "plain"))
        email_txt = email.as_string()
        server = smtplib.SMTP(email_infos["server"])
        server.starttls()
        server.sendmail(email_infos["sender"], email_infos["receivers"], email_txt)
        server.quit()
