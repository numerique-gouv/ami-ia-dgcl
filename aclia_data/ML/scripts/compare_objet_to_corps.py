"""
compare_objet_to_corps.py
==========================
Compare objet entities with corps entities
"""

import argparse
import logging
from typing import List, Tuple

import pandas as pd
from fuzzywuzzy import fuzz
from ML.ner import ner_model
from tqdm import tqdm

logging.basicConfig(format="%(asctime)s %(levelname)s:%(message)s", level=logging.INFO)


def objet_entities_in_corps(
    objet_entities: List[Tuple[str, str]], corps_entities: List[Tuple[str, str]], ratio: int
) -> bool:
    """Loop on all objet entities and check for the corresponding entities in corps

    Args:
        objet_entities (List[Tuple[str, str]]): List of objet entities
        with the format [("texte", "label"), ...]
        corps_entities (List[Tuple[str, str]]): List of corps entities
        with the format [("texte", "label"), ...]
        ratio (int): Minimum text similarity ratio between two entities

    Returns:
        bool: True if all objet entities are in the corps
    """
    for objet_entity in objet_entities:
        objet_text = objet_entity[0]
        objet_label = objet_entity[1]

        entity_found = False
        for corps_entity in corps_entities:
            corps_text = corps_entity[0]
            corps_label = corps_entity[1].split("-")[1].strip()

            if (objet_label == corps_label) and (fuzz.ratio(objet_text, corps_text) > ratio):
                entity_found = True

        if not entity_found:
            return False

    return True


def write_excel_file(filename: str, df: pd.DataFrame):
    """Write a dataframe to an excel file

    Args:
        filename (str): Name of the excel file
        df (pd.DataFrame): Dataframe to save in the excel file
    """
    writer = pd.ExcelWriter(filename, engine="openpyxl")
    df.to_excel(writer)
    writer.save()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Compare predicted entities for the objet and corps"
    )
    parser.add_argument(
        "-a",
        "--actes",
        help="Name of the table with actes",
        type=str,
        required=False,
        default="test_annotations",
    )

    parser.add_argument(
        "-o",
        "--objet",
        help="Path to the model that predicts entities in the objet",
        type=str,
        required=True,
    )

    parser.add_argument(
        "-c",
        "--corps",
        help="Path to the model that predicts entities in the corps",
        type=str,
        required=True,
    )

    args = parser.parse_args()

    actes_df = pd.read_pickle(args.actes)
    ai_objet_model = ner_model.SpacyModel.load_model(args.objet)
    ai_corps_model = ner_model.SpacyModel.load_model(args.corps)

    total_correct = {i: 0 for i in range(0, 120, 20)}  # Each index corresponding to a fuzzy ratio
    total_valid = 0  # Valid when there is at least 1 entity in the objet

    predictions_df = pd.DataFrame(
        columns=[
            "Entités objet",
            "Entités corps",
            "Match (ratio 0)",
            "Match (ratio 20)",
            "Match (ratio 40)",
            "Match (ratio 60)",
            "Match (ratio 80)",
            "Match (ratio 100)",
        ]
    )

    for i, row in tqdm(actes_df.iterrows(), total=actes_df.shape[0]):
        objet_entities = ai_objet_model.predict(row["objetacte"])
        objet_entities_tuple = [
            (row["objetacte"][entity[0] : entity[1]], entity[2]) for entity in objet_entities
        ]

        if len(objet_entities) > 0:
            corps_entities = ai_corps_model.predict(row["texte"])
            corps_entities_tuple = [
                (row["texte"][entity[0] : entity[1]], entity[2]) for entity in corps_entities
            ]

            total_valid += 1

            min_ratio = -1
            for ratio in sorted(total_correct.keys()):
                entities_match = objet_entities_in_corps(
                    objet_entities_tuple, corps_entities_tuple, ratio
                )

                if entities_match:
                    min_ratio = ratio

            for ratio in range(0, min_ratio + 1, 20):
                total_correct[ratio] += 1

            predictions_df = predictions_df.append(
                {
                    "Entités objet": objet_entities_tuple,
                    "Entités corps": corps_entities_tuple,
                    "Match (ratio 0)": min_ratio >= 0,
                    "Match (ratio 20)": min_ratio >= 20,
                    "Match (ratio 40)": min_ratio >= 40,
                    "Match (ratio 60)": min_ratio >= 60,
                    "Match (ratio 80)": min_ratio >= 80,
                    "Match (ratio 100)": min_ratio >= 100,
                },
                ignore_index=True,
            )

    logging.info(f"Support : {total_valid}")
    for ratio in total_correct.keys():
        logging.info(f"Score with  {ratio} ratio : {(total_correct[ratio] / total_valid):.2%}")

    logging.info("Saving predictions to ner_predictions.xlsx")

    write_excel_file("ner_predictions.xlsx", predictions_df)
