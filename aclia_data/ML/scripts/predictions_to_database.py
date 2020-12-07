"""
predictions_to_database.py
==================================================================
Script that predicts nature, matiere_1, matiere_2 and NER entities
and save them to the database
"""

import argparse
import configparser
import json
import logging
import os
import traceback
from typing import List

import pandas as pd
import sqlalchemy
from ML.classifier import classifier_model
from ML.ner import ner_model
from tqdm import tqdm

logging.basicConfig(format="%(asctime)s %(levelname)s:%(message)s", level=logging.INFO)


with open(os.path.join(os.path.dirname(__file__), "../rsc/natures.json"), "r") as f:
    NATURES = json.load(f)

with open(os.path.join(os.path.dirname(__file__), "../rsc/matieres_1.json"), "r") as f:
    MATIERES_1 = json.load(f)

with open(os.path.join(os.path.dirname(__file__), "../rsc/matieres_2.json"), "r") as f:
    MATIERES_2 = json.load(f)


def preprocess_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """
    Remove invalid values in the columns "nature", "matiere_1", "matiere_2"

    :param df: Dataframe to preprocess
    :return: Preprocessed dataframe
    """
    df["nature"] = df["nature"].replace({float("nan"): None, "A": None})
    df["matiere_1"] = df["matiere_1"].replace({"0": None, "n": None})
    df["matiere_2"] = df["matiere_2"].replace(
        {
            "0.0": None,
            "1.0": None,
            "2.0": None,
            "3.0": None,
            "4.0": None,
            "5.0": None,
            "6.0": None,
            "7.0": None,
            "nan": None,
        }
    )

    return df


def select_correct_model(directory: str, category: str) -> str:
    """
    Select the model in the directory corresponding to the correct category

    :param directory: Path to a directory containing all models
    :param category: Category the model has been trained on
    :return: Path to the model with the correct category
    """
    for filename in os.listdir(directory):
        filename_no_ext = os.path.splitext(os.path.basename(filename))[0]
        model_category = "_".join(filename_no_ext.split("_")[2:])

        if model_category == category:
            return os.path.join(directory, filename)


def load_model_classifier(directory: str, category: str) -> classifier_model.Classifier:
    """
    Load a model in the directory corresponding to the correct category

    :param directory: Path to a directory containing all models
    :param category: Category the model has been trained on
    :return: Trained model
    """
    filename = select_correct_model(directory, category)

    return classifier_model.Classifier.load_model(filename)


def load_model_ner(directory: str, category: str) -> classifier_model.Classifier:
    """
    Load a model in the directory corresponding to the correct category

    :param directory: Path to a directory containing all models
    :param category: Category the model has been trained on
    :return: Trained model
    """
    filename = select_correct_model(directory, category)

    return ner_model.SpacyModel.load_model(filename)


def nature_prediction_to_list(classifier: classifier_model.Classifier, text: str) -> List[dict]:
    """
    Predict a nature for the input text and return a list of strings
    with the format {"titre":..., "score":..., "isValid":None}

    :param classifier: Trained classifier that predicts a nature
    :param text: Input text to make the prediction
    :return: List of dict, one dict by nature
    """
    predictions = []
    probabilities = classifier.predict([text], probas=True)[0]

    for label, probability in zip(classifier.model.classes_, probabilities):
        predictions.append(
            {
                "titre": NATURES[label],
                "score": round(probability * 100, 3),
                "isValid": None,
            }
        )

    return predictions


def matiere_1_prediction_to_list(classifier: classifier_model.Classifier, text: str) -> List[dict]:
    """
    Predict a matiere_1 for the input text and return a list of strings
    with the format {"titre":..., "score":..., "isValid":None}

    :param classifier: Trained classifier that predicts a matiere_1
    :param text: Input text to make the prediction
    :return: List of dict, one dict by matiere_1
    """
    predictions = []
    probabilities = classifier.predict([text], probas=True)[0]

    for label, probability in zip(classifier.model.classes_, probabilities):
        predictions.append(
            {
                "titre": MATIERES_1[label],
                "score": round(probability * 100, 3),
                "isValid": None,
            }
        )

    return predictions


def matiere_2_prediction_to_list(
    classifier_matiere_1: classifier_model.Classifier,
    classifiers_matiere_2: classifier_model.Classifier,
    text: str,
) -> List[dict]:
    """
    Predict a matiere_1 to choose a classifiers_matiere_2
    and a matiere_2 for the input text and return a
    list of strings with the format {"titre":..., "score":..., "isValid":None}

    :param classifier_matiere_1: Trained classifier that predicts a matiere_1
    :param classifier_matiere_2: Trained classifier that predicts a matiere_2
    :param text: Input text to make the prediction
    :return: List of dict, one dict by matiere_2
    """
    matiere_1_code = classifier_matiere_1.predict([text])[0]
    classifier = classifiers_matiere_2[matiere_1_code]

    predictions = []
    probabilities = classifier.predict([text], probas=True)[0]

    for label, probability in zip(classifier.model.classes_, probabilities):
        predictions.append(
            {
                "titre": MATIERES_2[matiere_1_code][label.split(".")[-1]],
                "score": round(probability * 100, 3),
                "isValid": None,
            }
        )

    return predictions


def objet_prediction_to_list(
    classifier_nature: classifier_model.Classifier,
    ners: ner_model.SpacyModel,
    text: str,
    objet: str,
) -> List[dict]:
    """
    Predict a nature to choose a ner model then predict all entities for the input text and return a
    list of strings with the format {"start_pos":..., "end_pos":..., "label":..., "isValid":None}

    :param classifier_nature: Trained classifier that predicts a nature
    :param ners: Trained NER model that predicts objet entities
    :param text: Input text to make the prediction
    :param objet: Input objet to make the prediction
    :return: List of dict, one dict by entity
    """
    nature_code = classifier_nature.predict([text])[0]
    ner = ners[NATURES[nature_code]]

    tuple_prediction = ner.predict(objet)
    tuple_prediction = [tup + (None,) for tup in tuple_prediction]

    return [
        dict(zip(["start_pos", "end_pos", "label", "isValid"], prediction))
        for prediction in tuple_prediction
    ]


def init_engine() -> sqlalchemy.engine:
    """
    Initialize SQLAlchemy engine to send the dataframe to PostgreSQL
    """

    config = configparser.ConfigParser()
    conf_file_path = os.path.join(os.path.dirname(__file__), "../../config/ConfigSQL.cfg")
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
    engine = sqlalchemy.create_engine(PG_ACCESS_URL)

    return engine


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Make predictions with all models and send it to the database"
    )
    parser.add_argument(
        "-d",
        "--data",
        help="Pickle file containing all the data",
        type=str,
        required=True,
    )
    parser.add_argument(
        "-m",
        "--models",
        help="Path to the directory containing all the models",
        type=str,
        required=True,
    )
    parser.add_argument(
        "-n",
        "--name",
        help="Name for the table in the database",
        type=str,
        required=True,
    )
    args = parser.parse_args()

    logging.info("Load data and models")

    actes_df = pd.read_pickle(args.data)
    actes_df = preprocess_dataframe(actes_df)

    classifier_nature = load_model_classifier(args.models, "nature")
    classifier_matiere_1 = load_model_classifier(args.models, "matiere_1")
    classifiers_matiere_2 = {}
    for matiere_1 in MATIERES_1.keys():
        classifiers_matiere_2[matiere_1] = load_model_classifier(
            args.models, f"matiere_2_{matiere_1}"
        )

    ners_objet = {}
    for nature_abr, nature in zip(["DE", "AR", "AI", "CC"], NATURES.values()):
        ners_objet[nature] = load_model_ner(args.models, f"objet_{nature_abr}")

    logging.info("Saving predictions to the dataframe")

    df = pd.DataFrame()
    for i, row in tqdm(actes_df.iterrows()):

        list_nature = nature_prediction_to_list(classifier_nature, row["preprocessed_text"])
        list_matiere_1 = matiere_1_prediction_to_list(
            classifier_matiere_1, row["preprocessed_text"]
        )
        list_matiere_2 = matiere_2_prediction_to_list(
            classifier_matiere_1, classifiers_matiere_2, row["preprocessed_text"]
        )
        list_ner_objet = objet_prediction_to_list(
            classifier_nature, ners_objet, row["preprocessed_text"], row["objetacte"]
        )
        list_ner_corps = []

        df = df.append(
            {
                "noacte": row["noacte"],
                "corps_acte_text": row["texte"],
                "meta_objet_text": row["objetacte"],
                "nature": json.dumps(list_nature, ensure_ascii=False),
                "matiere_1": json.dumps(list_matiere_1, ensure_ascii=False),
                "matiere_2": json.dumps(list_matiere_2, ensure_ascii=False),
                "meta_objet_entities": json.dumps(list_ner_objet, ensure_ascii=False),
                "corps_acte_entities": json.dumps(list_ner_corps, ensure_ascii=False),
                "dept": row["dept"],
                "transmissible": None,
                "retour_transmissible": None,
                "statut": None,
            },
            ignore_index=True,
        )

    logging.info("Saving dataframe to database")

    engine = init_engine()

    df = df.drop_duplicates(subset=["noacte"])

    try:
        df.to_sql(args.name, con=engine, if_exists="replace", index=False)

        with engine.connect() as con:
            for col_entities in [
                "nature",
                "matiere_1",
                "matiere_2",
                "meta_objet_entities",
                "corps_acte_entities",
            ]:
                con.execute(
                    f"ALTER TABLE {args.name}\
                            ALTER COLUMN {col_entities} TYPE JSONB USING {col_entities}::JSONB;"
                )
            con.execute(
                f"ALTER TABLE {args.name}\
                        ALTER COLUMN statut TYPE integer USING statut::integer;"
            )
            con.execute(
                f"ALTER TABLE {args.name}\
                        ADD PRIMARY KEY (noacte);"
            )
    except:
        logging.error("Can't send command to database")
        print(traceback.format_exc())
