"""
ner_preprocessing.py
====================================
Module containing all functions relative to the preprocessing for the NER
"""

import copy
import random
import re
from typing import Dict, List, Tuple

import spacy
from spacy.gold import biluo_tags_from_offsets


def spacy_to_flair(data: List[Tuple]) -> List[Tuple[str, str]]:
    """
    Convert spacy annotations to flair annotations
    :param annotations: spacy annotations with the format
    [("text", {'entities':[(0, 5, "label_1"), (7, 10, "label_2")]})]

    :return: flair annotations with the format
    [("word_1", "biluo_label_1"), ("word_2", "biluo_label_2")]
    """
    text = data[0]
    entities = data[1]["entities"]
    nlp = spacy.blank("fr")
    doc = nlp(text)
    tokens = [t.text for t in doc]

    biluo_tags = biluo_tags_from_offsets(doc, entities)

    for i in range(len(biluo_tags)):
        if biluo_tags[i] == "-":  # Convert unknown tag to "O" tag
            biluo_tags[i] = "O"
    return [(token, tag) for token, tag in zip(tokens, biluo_tags)]


def annotations_objet_to_spacy(objets: List[str], annotated_entities: List[Dict]) -> List[Tuple]:
    """
    Convert objet annotations to the spacy format and clean overlapping entities
    :param objets: List of objets (acte)
    :param annotated_entities: List of annotated entities,
    each dict must at least contain 'startpos', 'endpos' and 'categorie'

    :return: spacy annotations with the format
    [("text", {'entities':[(0, 5, "label_1"), (7, 10, "label_2")]})]
    """
    spacy_annotations = []

    for objet_text, objet_annotations in zip(objets, annotated_entities):
        spacy_entities = []
        for annotation in objet_annotations:
            # TODO : move fix when data is imported
            if annotation["categorie"] == "Destinaire":
                annotation["categorie"] = "Destinataire"
            spacy_entities.append(
                (
                    annotation["startpos"] - 1,
                    annotation["endpos"],
                    annotation["categorie"],
                )
            )

        spacy_annotations.append((objet_text, {"entities": spacy_entities}))

    spacy_annotations = drop_overlapping_annotations(spacy_annotations)
    spacy_annotations = trim_entity_spans(spacy_annotations)
    return spacy_annotations


def annotations_corps_to_spacy(
    corps: List[str], annotated_entities: List[Dict], only_objet: bool = False
) -> List[Tuple]:
    """
    Convert corps annotations to the spacy format and clean overlapping entities
    :param corps: List of corps (acte)
    :param annotated_entities: List of annotated entities,
    each dict must at least contain 'startpos', 'endpos' and 'categorie'
    :param only_objet: If true, only keep the entities related to objet

    :return: spacy annotations with the format
    [("text", {'entities':[(0, 5, "label_1"), (7, 10, "label_2")]})]
    """
    spacy_annotations = []

    for corps_text, corps_annotations in zip(corps, annotated_entities):
        spacy_entities = []
        for annotation in corps_annotations:
            if only_objet and "Objet" not in annotation["concept"]:
                continue
            spacy_entities.append(
                (
                    annotation["startpos"] - 1,
                    annotation["endpos"],
                    annotation["concept"],
                )
            )

        spacy_annotations.append((corps_text, {"entities": spacy_entities}))

    spacy_annotations = drop_overlapping_annotations(spacy_annotations)
    spacy_annotations = trim_entity_spans(spacy_annotations)
    return spacy_annotations


def split_data(annotations: List[Tuple], train_ratio: float = 0.8) -> Tuple:
    """
    Split data into train set and validation set
    :param annotations: List of annotations to split with format
    [("text", {'entities':[(0, 5, "label_1"), (7, 10, "label_2")]})]
    :param train_ratio: train ratio for the split (between 0 and 1)

    :return: Tuple of split data (train_data, test_data)
    """
    random.shuffle(annotations)
    train_data = annotations[0 : int(train_ratio * len(annotations))]
    test_data = annotations[int(train_ratio * len(annotations)) :]

    return (train_data, test_data)


def overlap_one_in_list(pos: Tuple[int, int], list_pos: List[Tuple[int, int]]) -> bool:
    """
    Tell wether pos overlaps at least one of the pos inside list_pos
    :param pos: Tuple containing the start and end position (start, end)
    :param list_pos: List of tuples containing the start and end position
    [(start_1, end_1), (start_2, end_2)]

    :return: True if there is an overlap
    """
    is_overlapping = False

    for pos_i in list_pos:
        is_overlapping = get_overlap(pos, pos_i)
        if is_overlapping:
            break
    return is_overlapping


def drop_overlapping_annotations(data_set: List[Tuple]) -> List[Tuple]:
    """
    Remove all entities that overlap other entities and keep the first occurence
    :param data_set: List of spacy annotations sorted by position (start, end)

    :return: List of spacy annotations without overlapping annotations
    """
    data_set_res = copy.deepcopy(data_set)
    nb_annotations_init = 0
    nb_annotations_kept = 0
    for i in range(len(data_set_res)):  # iterate over paragraph annotated
        entry = data_set_res[i]
        """
        print(entry)
        print("i:", i)
        print("")
        """
        nb_annotations_init += len(entry[1]["entities"])
        # keep annotations that doesn't overlap kept ones
        if len(entry[1]["entities"]) != 0:
            list_kept_annotations = [
                entry[1]["entities"][0]
            ]  # initialize with the first annotation inside the paragraph
            for i in range(1, len(entry[1]["entities"])):
                annotation_current = entry[1]["entities"][i]
                if not overlap_one_in_list(annotation_current, list_kept_annotations):
                    list_kept_annotations.append(annotation_current)
            nb_annotations_kept += len(list_kept_annotations)
            entry[1]["entities"] = list_kept_annotations
    return data_set_res


def get_overlap(pos_1: Tuple[int, int], pos_2: Tuple[int, int]) -> bool:
    """
    Tell if pos 1 overlaps pos 2
    :param pos_1: Tuple containing the start and end position (start, end)
    :param pos_2: Tuple containing the start and end position (start, end)

    :return: True if pos_1 overlaps pos_2
    """
    return max(0, min(pos_1[1], pos_2[1]) - max(pos_1[0], pos_2[0]))


def trim_entity_spans(data: List[Tuple]) -> List[Tuple]:
    """
    Removes leading and trailing white spaces from entity spans
    :param data: The data to be cleaned in spaCy format
    [("text", {'entities':[(0, 5, "label_1"), (7, 10, "label_2")]})]

    :return: The cleaned data
    """
    invalid_span_tokens = re.compile(r"\s")

    cleaned_data = []
    for text, annotations in data:
        entities = annotations["entities"]
        valid_entities = []
        for start, end, label in entities:
            if start > len(text) or end > len(text):
                continue
            valid_start = start
            valid_end = end
            while valid_start < len(text) and invalid_span_tokens.match(text[valid_start]):
                valid_start += 1
            while valid_end > 1 and invalid_span_tokens.match(text[valid_end - 1]):
                valid_end -= 1
            valid_entities.append([valid_start, valid_end, label])
        cleaned_data.append([text, {"entities": valid_entities}])

    return cleaned_data
