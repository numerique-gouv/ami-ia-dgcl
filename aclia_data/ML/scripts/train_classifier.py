"""
train_classifier.py
============================
Script to train a classifier
"""

import argparse
import json
import logging
import os
import shutil
import sys
import warnings
from itertools import product

import numpy as np
import pandas as pd
import xgboost as xgb
import yaml
from ML.classifier import classifier_model, classifier_preprocessing
from sklearn.feature_extraction.text import CountVectorizer

warnings.filterwarnings("ignore")
logging.basicConfig(format="%(asctime)s %(levelname)s:%(message)s", level=logging.INFO)

with open(os.path.join(os.path.dirname(__file__), "../rsc/matieres_2.json"), "r") as f:
    MATIERES_2 = json.load(f)


def product_dict(**kwargs):
    """Cartesian product of lists with their corresponding dictionary keys"""
    keys = kwargs.keys()
    vals = kwargs.values()
    for instance in product(*vals):
        yield dict(zip(keys, instance))


def label_scores(score: dict):
    """Return a list combining the labels and the metrics (ex: '2_precision') and
    a list with the corresponding values

    :param score: dict obtained from sklearn classification report
    """
    label_keys = []
    label_values = []

    metric_keys = ["precision", "recall", "support"]

    for label_key, score_dict in list(score.items())[:-3]:
        updated_dict = {metric_key: score_dict[metric_key] for metric_key in metric_keys}

        for metric_key, metric_value in list(updated_dict.items()):
            label_keys.append(label_key + "_" + metric_key)
            if metric_key == "support":
                label_values.append(metric_value)
            else:
                label_values.append(round(metric_value * 100, 2))

    return label_keys, label_values


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Load data & train classification model")
    parser.add_argument(
        "-d",
        "--dataset",
        help="Path to the dataset",
        type=str,
        required=False,
        default=None,
    )
    parser.add_argument(
        "-t",
        "--type",
        help="Type of labels to train on",
        type=str,
        required=True,
        choices=[
            "nature",
            "matiere_1",
            "matiere_2_1",
            "matiere_2_2",
            "matiere_2_3",
            "matiere_2_4",
            "matiere_2_5",
            "matiere_2_6",
            "matiere_2_7",
            "isTransmissible",
        ],
    )
    parser.add_argument(
        "-c",
        "--config",
        help="Path to the config yaml file",
        type=str,
        required=False,
        default="../../config/ConfigClassifier.yaml",
    )
    parser.add_argument(
        "-s",
        "--save",
        help="Path where to save the training",
        type=str,
        required=False,
        default=None,
    )
    args = parser.parse_args()

    logging.info("Read dataset")
    try:
        df = pd.read_pickle(args.dataset)
    except FileNotFoundError:
        logging.error(f"No dataset found at {args.dataset}")
        sys.exit()

    type_column = "_".join(args.type.split("_")[0:2])

    # Create main directory
    if args.save is not None:
        if os.path.exists(args.save):
            shutil.rmtree(args.save)
        os.mkdir(args.save)
        model_dir = os.path.join(args.save, "models")
        os.mkdir(model_dir)

    if type_column == "nature":
        df = df.dropna(subset=["nature"])
        df = df[df["nature"].isin(["1", "2", "3", "4"])]
    elif type_column == "matiere_1":
        df = df.dropna(subset=["matiere_1"])
        df = df[df["matiere_1"].isin(["1", "2", "3", "4", "5", "6", "7"])]
    elif type_column == "matiere_2":
        df = df.dropna(subset=["matiere_2"])
        matiere_1_code = args.type.split("_")[2]
        matieres_2 = [
            ".".join([matiere_1_code, niveau_2]) for niveau_2 in MATIERES_2[matiere_1_code].keys()
        ]
        df = df[df["matiere_2"].isin(matieres_2)]
    elif type_column == "isTransmissible":
        df = df.dropna(subset=["isTransmissible"])

    if "split" not in df.columns:
        df["split"] = classifier_preprocessing.split_data(df)
    if "preprocessed_text" not in df.columns:
        df["preprocessed_text"] = classifier_preprocessing.preprocess(df["texte"], stemming=False)

    if args.save is not None:
        df.to_pickle(os.path.join(args.save, f"{args.type}_dataset.pkl"))

    X_train, y_train = classifier_preprocessing.get_x_y_set(
        df, "preprocessed_text", type_column, split="TRAIN"
    )
    X_test, y_test = classifier_preprocessing.get_x_y_set(
        df, "preprocessed_text", type_column, split="TEST"
    )

    # Load parameters from config file
    with open(args.config, "r") as f:
        dictionary = yaml.load(f, Loader=yaml.FullLoader)
        parameters_vectorizer = list(product_dict(**dictionary["bow"]))
        parameters_model = list(product_dict(**dictionary["xgb"]))

    # Train with each set of parameters
    results = []
    for i, param_model in enumerate(parameters_model):
        for j, param_vector in enumerate(parameters_vectorizer):
            logging.info(
                "-- PARAMETERS VECTORIZER > "
                + " ".join(f"{k}: {v}" for k, v in param_vector.items())
                + " --"
            )
            logging.info(
                "-- PARAMETERS MODEL > "
                + " ".join(f"{k}: {v}" for k, v in param_model.items())
                + " --"
            )

            if len(np.unique(y_train)) > 2:
                objective = "multi:softprob"
            else:
                objective = "binary:logistic"

            xgb_model = xgb.XGBClassifier(objective=objective, **param_model)
            vectorizer = CountVectorizer(**param_vector)
            clf = classifier_model.Classifier(xgb_model, vectorizer)
            clf.train(X_train, y_train)
            score = clf.test(X_test, y_test)
            avg_score = score["weighted avg"]
            logging.info(
                f'p : {round(avg_score["precision"]*100, 2)}\
                , r : {round(avg_score["recall"]*100, 2)}\
                , s : {avg_score["support"]}'
            )

            if args.save is not None:
                model_path = os.path.join(model_dir, f"id_{i}{j}_{args.type}.model")
                label_keys, label_values = label_scores(score)
                results.append(
                    [
                        *param_vector.values(),
                        *param_model.values(),
                        round(avg_score["precision"] * 100, 2),
                        round(avg_score["recall"] * 100, 2),
                        len(X_train),
                        avg_score["support"],
                        model_path,
                        *label_values,
                    ]
                )
                clf.save_model(model_path)

                result_path = os.path.join(args.save, os.path.basename(args.save) + ".xlsx")
                if os.path.exists(result_path):
                    os.remove(result_path)

                df = pd.DataFrame(
                    results,
                    columns=[
                        *param_vector.keys(),
                        *param_model.keys(),
                        "precision",
                        "recall",
                        "train_support",
                        "test_support",
                        "model_name",
                        *label_keys,
                    ],
                )
                writer = pd.ExcelWriter(result_path, engine="openpyxl")
                df.to_excel(writer)
                writer.save()
