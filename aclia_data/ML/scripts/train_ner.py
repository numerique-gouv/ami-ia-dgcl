"""
train_ner.py
===========================
Script to train a ner model
"""

import argparse
import logging
import os
import pickle
import shutil
import sys
from itertools import product

import pandas as pd
import yaml
from ML.ner import ner_model, ner_preprocessing

logging.basicConfig(format="%(asctime)s %(levelname)s:%(message)s", level=logging.INFO)


def product_dict(**kwargs):
    """Cartesian product of lists with their corresponding dictionary keys"""
    keys = kwargs.keys()
    vals = kwargs.values()
    for instance in product(*vals):
        yield dict(zip(keys, instance))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Load data & train NER model")
    parser.add_argument(
        "-d", "--dataset", help="Path to the dataset with NER annotations", type=str, required=True
    )
    parser.add_argument(
        "-t",
        "--type",
        help="Type of labels to train on",
        type=str,
        required=True,
        choices=["corps", "objet"],
    )
    parser.add_argument(
        "-c",
        "--config",
        help="Path to the config yaml file",
        type=str,
        required=False,
        default="../../config/ConfigNER.yaml",
    )
    parser.add_argument(
        "-s", "--save", help="Path where to save the training", type=str, required=True
    )
    args = parser.parse_args()

    logging.info("Read dataset")
    try:
        annotations_df = pd.read_pickle(args.dataset)
    except:
        logging.error(f"No dataset found at {args.dataset}")
        sys.exit()

    # Create main directory
    if args.save is not None:
        if os.path.exists(args.save):
            shutil.rmtree(args.save)
        os.mkdir(args.save)

    # Format dataset and create folders if save=True
    logging.info("Format dataset")
    annotations = {}

    for nature in ["DE", "AR", "AI", "CC"]:
        if args.type == "corps":
            annotations_corps = annotations_df[annotations_df["nature_label"] == nature].dropna(
                subset=["texte", "corps"]
            )
            annotations_format = ner_preprocessing.annotations_corps_to_spacy(
                annotations_corps["texte"], annotations_corps["corps"], only_objet=True
            )
        elif args.type == "objet":
            annotations_objet = annotations_df[annotations_df["nature_label"] == nature].dropna(
                subset=["objetacte", "metaObjet"]
            )
            annotations_format = ner_preprocessing.annotations_objet_to_spacy(
                annotations_objet["objetacte"], annotations_objet["metaObjet"]
            )
        annotations[nature] = ner_preprocessing.split_data(annotations_format)
        logging.info(
            f"Nature : {nature}, \
            actes : {len(annotations[nature][0]) + len(annotations[nature][1])}"
        )

        if args.save is not None:
            nature_dir = os.path.join(args.save, nature)
            os.mkdir(nature_dir)
            os.mkdir(os.path.join(nature_dir, "models"))

            with open(os.path.join(*[args.save, nature, f"train_data_{nature}.pkl"]), "wb") as fp:
                pickle.dump(annotations[nature][0], fp)
            with open(os.path.join(*[args.save, nature, f"test_data_{nature}.pkl"]), "wb") as fp:
                pickle.dump(annotations[nature][1], fp)

    ner = ner_model.SpacyModel()

    # Load parameters from config file
    with open(args.config, "r") as f:
        dictionary = yaml.load(f, Loader=yaml.FullLoader)["hyperparameters"]
        parameters = product_dict(**dictionary)

    # Train with each set of parameters
    results = []
    for i, parameter in enumerate(parameters):
        logging.info(
            "-- PARAMETERS > " + " ".join(f"{k}: {v}" for k, v in parameter.items()) + " --"
        )
        for nature in ["DE", "AR", "AI", "CC"]:
            (train_data, test_data) = annotations[nature]

            ner.train(
                train_data,
                save_training=os.path.join(
                    *[args.save, nature, "models", f"id_{i}_{args.type}_{nature}_training_log"]
                ),
                **parameter,
            )
            train_support = ner.test(train_data)["partial"]["total_score"]["support"]
            score = ner.test(test_data)
            partial_total_score = score["partial"]["total_score"]
            strict_total_score = score["strict"]["total_score"]
            logging.info(
                f'Nature : {nature}, \
                p : {strict_total_score["precision"]}, \
                r : {strict_total_score["recall"]}, \
                s : {strict_total_score["support"]}'
            )

            if args.save is not None:
                model_path = os.path.join(
                    *[args.save, nature, "models", f"id_{i}_{args.type}_{nature}.model"]
                )
                results.append(
                    [
                        *parameter.values(),
                        partial_total_score["precision"],
                        partial_total_score["recall"],
                        strict_total_score["precision"],
                        strict_total_score["recall"],
                        train_support,
                        partial_total_score["support"],
                        nature,
                        model_path,
                        score,
                    ]
                )
                ner.save_model(model_path)

                result_path = os.path.join(args.save, "results.xlsx")
                if os.path.exists(result_path):
                    os.remove(result_path)

                df = pd.DataFrame(
                    results,
                    columns=[
                        *parameter.keys(),
                        "partial_precision",
                        "partial_recall",
                        "strict_precision",
                        "strict_recall",
                        "train_support",
                        "test_support",
                        "nature",
                        "model_name",
                        "label_scores",
                    ],
                )
                writer = pd.ExcelWriter(result_path, engine="openpyxl")
                df.to_excel(writer)
                writer.save()
