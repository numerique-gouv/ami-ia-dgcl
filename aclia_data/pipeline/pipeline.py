"""
pipeline.py
==================================================
Module to extract text and metadata from the actes
"""

import gzip
import logging
import os
import pickle
import re

import pandas as pd

from pipeline import extract, utils

logging.basicConfig(format="%(asctime)s %(levelname)s:%(message)s", level=logging.INFO)


class Pipeline:
    def __init__(self):

        self.data = pd.DataFrame()
        self.metadata = pd.DataFrame()

    def clean_text(self, text):
        text = text.strip(" \n")
        text = re.sub("\n{2,}", "\n\n", text)

    def add_data(self, path, unzip=False, multiprocessing=True, num_cores=-1):

        logging.info(f"Read data from {path}")

        if unzip:
            logging.info("Unzip file")
            utils.unzip(path)

        path_no_ext = utils.remove_extension(path)
        data_df = pd.DataFrame({"path": utils.get_file_paths(path_no_ext, recursive=True)})
        data_df["folder"] = data_df["path"].apply(lambda path: utils.get_folder(path))
        data_df["filename"] = data_df["path"].apply(lambda path: os.path.basename(path))

        logging.info("Extract text from PDFs")
        if multiprocessing:
            data_df["extracted_text"] = utils.multiprocessing(
                data_df["path"].values, extract.text_from_pdf, workers=num_cores
            )
        else:
            data_df["extracted_text"] = data_df["path"].apply(
                lambda path: extract.text_from_pdf(path)
            )

        data_df["extracted_text"] = data_df["extracted_text"].apply(
            lambda text: self.clean_text(text)
        )

        logging.info("Add PDF metadata")
        data_df[
            [
                "pdf_type",
                "producer",
                "creation_date",
                "num_pages",
                "num_files",
                "pj_acte_principal",
            ]
        ] = data_df["path"].apply(lambda path: pd.Series(extract.get_metadata_pdf(path)))

        self.data = pd.concat([self.data, data_df])

        self.data = self.data.drop_duplicates(subset="path")

        logging.info("Data successfully added to pipeline")
        logging.info("-----------------------------------")

    def add_metadata(self, path, unzip=False, col_actes="noacte", col_docs="t_acte_noacte"):

        if unzip:
            logging.info("Unzip file")
            utils.unzip(path)

        t_actes = pd.DataFrame()
        t_documents = pd.DataFrame()

        path_no_ext = utils.remove_extension(path)

        logging.info(f"Read metadata from {path}")
        for filename in utils.get_file_paths(path_no_ext, extension=".csv", recursive=True):
            if "t_actes" in os.path.basename(filename):
                t_actes = pd.concat(
                    [t_actes, pd.read_csv(filename, encoding="latin-1", dtype=object)]
                )
            elif "t_documents" in os.path.basename(filename):
                t_documents = pd.concat(
                    [t_documents, pd.read_csv(filename, encoding="latin-1", dtype=object)]
                )

        metadata_df = self._join_metadata(t_actes, t_documents)

        self.metadata = pd.concat([self.metadata, metadata_df])

        self.metadata = self.metadata.drop_duplicates(subset="noacte")

        logging.info("Metadata successfully added to pipeline")
        logging.info("---------------------------------------")

    def get_full_table(self):

        if len(self.data) == 0 or len(self.metadata) == 0:
            logging.warning("Data or Metadata table empty")
            return None

        return self._join_data_metadata(self.data, self.metadata)

    def _join_metadata(self, actes_df, docs_df, col_actes="noacte", col_docs="t_acte_noacte"):
        new_col = col_actes

        actes_df = (
            actes_df.set_index(col_actes)
            .join(docs_df.set_index(col_docs))
            .reset_index()
            .rename(columns={"index": new_col})
        )
        return actes_df

    def _join_data_metadata(self, data_df, metadata_df, col_data="folder", col_meta="noacte"):
        new_col = col_meta

        data_df = (
            data_df.set_index(col_data)
            .join(metadata_df.set_index(col_meta))
            .reset_index()
            .rename(columns={"index": new_col})
        )
        return data_df

    def save_pipeline(self, path):
        with gzip.GzipFile(path, "wb") as file:
            pickle.dump(self.data, file, protocol=-1)
            pickle.dump(self.metadata, file, protocol=-1)

    def load_pipeline(self, path):
        with gzip.GzipFile(path, "rb") as file:

            self.data = pickle.load(file)
            self.metadata = pickle.load(file)
