"""
classifier_preprocessing.py
================================================================================
Module containing all functions relative to the preprocessing for the classifier
"""

import logging
import os
import re
import string
from typing import List, Set, Tuple

import numpy as np
import pandas as pd
import unidecode
from nltk.corpus import stopwords
from nltk.stem.snowball import FrenchStemmer
from nltk.tokenize import word_tokenize
from tqdm import tqdm

STOPWORDS_PATH = os.path.join(os.path.dirname(__file__), "stopwords/")
logging.basicConfig(format="%(asctime)s %(levelname)s:%(message)s", level=logging.INFO)


def split_data(df: pd.DataFrame, train_ratio: float = 0.8, seed: int = 0) -> pd.DataFrame:
    """
    Create a new column 'split' in the dataframe and randomly insert 'TRAIN' or 'TEST' values
    :param df: pandas Dataframe to split
    :param train_ratio: The ratio must be between 0 and 1
    :param seed: set a value for the seed
    :return: Input dataframe with a new column 'split'
    """
    np.random.seed(seed)
    splits = ["TRAIN", "TEST"]

    df["split"] = np.random.choice(splits, len(df), p=[train_ratio, 1 - train_ratio])

    for s in splits:
        split_len = len(df[df["split"] == s])
        logging.info(f"{s} files : {split_len} ({split_len*100/len(df):.2f}%)")

    return df


def get_x_y_set(df: pd.DataFrame, x_col: str, y_col: str, split: str = "train"):
    """Get two columns for a specific set

    :param df: Dataframe with the X and y columns and a column "split"
    :param x_col: Name for the x column
    :param y_col: Name for the y column
    :param split: 'train', 'test', 'valid' or 'all'
    """
    dataset = get_set(df, split=split)

    return (dataset[x_col], dataset[y_col])


def get_set(df: pd.DataFrame, split: str = "train"):
    """Get a specific set

    :param df: Dataframe with the column "split"
    :param split: 'train', 'test', 'valid' or 'all'
    """
    if split == "all":
        return df

    if "split" not in df.columns:
        logging.error("Dataframe must be split first")
        return None

    dataset = df[df["split"] == split.upper()]

    return dataset


def remove_accents(text):
    return unidecode.unidecode(text)


def text_lowercase(text):
    return text.lower()


def keep_alphanumeric(text):
    pattern = re.compile(r"[\W_]+", re.UNICODE)
    return pattern.sub(" ", text)


def letters_only(text):
    return re.sub("[^a-zA-Z]+", " ", text)


def remove_punctuation(text):
    punctuation = string.punctuation + "’—°€"
    for punct in punctuation:
        text = text.replace(punct, " ")
    return text


def remove_digits(text):
    for digit in string.digits:
        text = text.replace(digit, " ")
    return text


def tokenize(text):
    text = word_tokenize(text)
    return text


def remove_stopwords(text, stopwords=[]):
    text = tokenize(text)
    text = [word for word in text if word not in stopwords]
    text = " ".join(text)
    return text


def replace_entities(text, entities, token):
    entities_regex = r"\b" + entities[0] + r"\b"
    for ent in entities[1:]:
        entities_regex = entities_regex + r"|\b" + ent + r"\b"

    text = re.sub(entities_regex, token, text)
    return text


def load_list_from_file(path):
    with open(path, "r", encoding="utf8") as f:
        word_list = f.read().split()

    return set(word_list)


def load_stopwords() -> Set:
    """
    Load stopwords located in the stopwords folder

    :return: Set of all stopwords
    """
    stopwords_list = set(stopwords.words("french"))

    stopwords_path = os.path.join(STOPWORDS_PATH, "stopwords.txt")
    stopwords_list |= load_list_from_file(stopwords_path)

    days_path = os.path.join(STOPWORDS_PATH, "days.txt")
    stopwords_list |= load_list_from_file(days_path)

    months_path = os.path.join(STOPWORDS_PATH, "months.txt")
    stopwords_list |= load_list_from_file(months_path)

    actes_sw_path = os.path.join(STOPWORDS_PATH, "actes_stopwords.txt")
    stopwords_list |= load_list_from_file(actes_sw_path)

    stopwords_list = [remove_accents(sw) for sw in stopwords_list]

    return stopwords_list


def load_stopword_entities() -> List[Tuple[Set, str]]:
    """
    Load villes, departement, region and prenom entities
    and return a list of entities with their name

    :return: List of tuple [(villes, "eville"),
        (departements, "edepartement"),
        (regions, "eregion"),
        (prenoms, "eprenom"),]
    """

    villes_df = pd.read_csv(
        os.path.join(STOPWORDS_PATH, "villes.csv"), dtype={"dept": str, "code_commune": str}
    )
    villes = villes_df[villes_df["pop_2010"] > 2000]["nom_simple"].values
    communes_df = pd.read_csv(os.path.join(STOPWORDS_PATH, "communes-departement-region.csv"))
    depts = set(
        communes_df["nom_departement"]
        .apply(lambda d: remove_accents(str(d).lower()).replace("-", " "))
        .values
    )
    depts.remove("nan")
    regions = set(
        communes_df["nom_region"]
        .apply(lambda r: remove_accents(str(r).lower()).replace("-", " "))
        .values
    )
    regions.remove("nan")

    prenoms_df = pd.read_csv(
        os.path.join(STOPWORDS_PATH, "prenoms_2018.csv"),
        sep=";",
    )

    prenoms_df = prenoms_df[prenoms_df["annais"] != "XXXX"]
    prenoms_df = prenoms_df.groupby(["preusuel", "sexe"]).sum().reset_index()
    prenoms_df = prenoms_df[prenoms_df["nombre"] > 1000]
    prenoms = set(prenoms_df["preusuel"].apply(lambda p: remove_accents(str(p).lower())).values)

    entities = [
        (list(villes), "eville"),
        (list(depts), "edepartement"),
        (list(regions), "eregion"),
        (list(prenoms), "eprenom"),
    ]

    return entities


def preprocessing(texts: List, stemming: bool = True) -> List:
    """
    Preprocess the text by removing accents, keeping only letters and lowercasing.
    It also removes all stopwords and entities (villes, depts, region, prenoms)

    :param text: List of texts to apply the preprocessing on
    :param stemming: If True, will apply stemming on all the text
    """
    stopwords = load_stopwords()
    stopword_entities = load_stopword_entities()

    for i, text in enumerate(tqdm(texts)):
        text = text.replace("€", "euros")
        text = remove_accents(text)
        text = letters_only(text)
        text = text_lowercase(text)
        text = re.sub(r"\beur\b", "euros", text)

        for entity_list, entity_token in stopword_entities:
            text = replace_entities(text, entities=entity_list, token=entity_token)

        text = remove_stopwords(text, stopwords=stopwords)

        if stemming:
            stemmer = FrenchStemmer()
            text = stemmer.stem(text)

        texts[i] = text

    return texts


def preprocessing_matiere_1(texts: List, stemming: bool = True) -> List:
    """
    Apply the function preprocessing() and removes all matiere_1 stopwords

    :param texts: List of texts to apply the preprocessing on
    :param stemming: If True, will apply stemming on all the text
    """
    matiere_1_stopwords_path = os.path.join(STOPWORDS_PATH, "matiere_1_stopwords.txt")
    matiere_1_stopwords = load_list_from_file(matiere_1_stopwords_path)

    texts = preprocessing(texts, stemming)

    for i, text in enumerate(texts):
        texts[i] = remove_stopwords(text, stopwords=matiere_1_stopwords)

    return texts
