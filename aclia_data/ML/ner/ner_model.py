"""
classifier_model.py
====================================
Module containing all functions relative to the NER model
"""

import logging
import os
import random
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Dict, List, Tuple, Union

import numpy as np
import spacy
from flair.data import Sentence
from flair.datasets import ColumnCorpus
from flair.embeddings import StackedEmbeddings, TransformerWordEmbeddings, WordEmbeddings
from flair.models import SequenceTagger
from flair.trainers import ModelTrainer
from ML.ner import evaluator, ner_preprocessing
from spacy.gold import biluo_tags_from_offsets

logging.basicConfig(format="%(asctime)s %(levelname)s:%(message)s", level=logging.INFO)


class NerModel(ABC):
    @abstractmethod
    def train(
        self,
        train_data: List[Tuple],
        save_training: Union[str, Path],
        epochs: int,
        learning_rate: float,
    ) -> None:
        pass

    @abstractmethod
    def predict(self, text: str) -> List[Tuple[int, int, str]]:
        pass

    @staticmethod
    @abstractmethod
    def load_model(path: Union[str, Path]):
        pass

    def test(self, test_data: List[Tuple]) -> Dict:
        """
        Return a dict of metrics for the trained model with test_data
        :param test_data: Data with the following format :
        [("text", {'entities':[(0, 5, "label_1"), (7, 10, "label_2")]})]
        :return: Dict with 'partial' (at least 1 entity token overlaps)
        or 'strict' (all entity tokens must overlap)
        """

        gold_entities = []
        predicted_entities = []

        nlp = spacy.blank("fr")
        for sample in test_data:
            doc = nlp(sample[0])
            entities = sample[1]["entities"]

            gold_entity_sample = biluo_tags_from_offsets(doc, entities)
            gold_entities.append(gold_entity_sample)

            prediction_sample = self.predict(sample[0])
            biluo_prediction = biluo_tags_from_offsets(doc, prediction_sample)
            predicted_entities.append(biluo_prediction)

        labels = np.unique([entity[2] for row in test_data for entity in row[1]["entities"]])

        evaluator_obj = evaluator.Evaluator(gold_entities, predicted_entities, labels)
        results, results_agg = evaluator_obj.evaluate()

        # Save scores to a dictionary
        scores = {}

        scores["partial"] = {
            k: evaluator.evaluate_score_to_custom(results_agg[k]["ent_type"])
            for k in results_agg.keys()
        }
        scores["partial"]["total_score"] = evaluator.evaluate_score_to_custom(results["ent_type"])

        scores["strict"] = {
            k: evaluator.evaluate_score_to_custom(results_agg[k]["strict"])
            for k in results_agg.keys()
        }
        scores["strict"]["total_score"] = evaluator.evaluate_score_to_custom(results["strict"])

        return scores


class FlairModel(NerModel):
    def __init__(self):
        self.nlp = spacy.blank("fr")
        self.tagger = None

    def data_to_txt(self, data: List[Tuple], path: Union[str, Path]):
        """
        Save data to a txt file
        :param data: [("text", {'entities':[(0, 5, "label_1"), (7, 10, "label_2")]})]
        :param path: Path to the .txt file
        """
        with open(path, "w", encoding="utf8") as f:
            for row in data:
                flair_annotations = ner_preprocessing.spacy_to_flair(row)

                for (token, tag) in flair_annotations:
                    f.write(f"{token} {tag}\n".replace("L-", "E-").replace("U-", "S-"))

                f.write("\n")

    def train(
        self,
        train_data: List[Tuple],
        test_data: List[Tuple],
        save_training: Union[str, Path],
        epochs: int = 150,
        learning_rate: float = 0.1,
        embedding: str = "fasttext",
        model_size: int = 256,
        batch_size: int = 1,
    ) -> None:
        """
        Train and test a flair model and save all training logs in a directory
        :param train_data: train data with the spacy format
        [("text", {'entities':[(0, 5, "label_1"), (7, 10, "label_2")]})]
        :param save_training: directory with all data, logs and trained models
        :param epochs: max number of epochs for training
        :param learning_rate: learning rate for training
        :param embedding: embedding to use ('fasttext' or 'bert')
        :param model_size: number of hidden states in RNN
        :param batch_size: size of batch during training
        """
        # cast string to Path
        if type(save_training) is str:
            save_training = Path(save_training)

        if os.path.exists(save_training):
            logging.error(f'"{save_training}" already exists')
            return
        else:
            os.mkdir(save_training)
            logging.info(f'"{save_training}" created')

        self.data_to_txt(train_data, os.path.join(save_training, "train.txt"))
        self.data_to_txt(test_data, os.path.join(save_training, "test.txt"))

        columns = {0: "text", 1: "ner"}
        corpus = ColumnCorpus(
            save_training,
            columns,
            train_file="train.txt",
            test_file="test.txt",
            dev_file="test.txt",
        )

        tag_dictionary = corpus.make_tag_dictionary(tag_type="ner")

        embedding_types = None
        if embedding == "fasttext":
            embedding_types = [WordEmbeddings("fr")]  # FastText
        elif embedding == "bert":
            embedding_types = [TransformerWordEmbeddings("bert-base-multilingual-cased")]  # BERT

        embeddings = StackedEmbeddings(embeddings=embedding_types)

        self.tagger = SequenceTagger(
            hidden_size=model_size,
            embeddings=embeddings,
            tag_dictionary=tag_dictionary,
            tag_type="ner",
        )

        training_log_path = os.path.join(save_training, "training_log")
        os.mkdir(training_log_path)

        trainer = ModelTrainer(self.tagger, corpus)
        trainer.train(
            training_log_path,
            learning_rate=learning_rate,
            mini_batch_size=batch_size,
            max_epochs=epochs,
        )

    def predict(self, text: str) -> List[Tuple[int, int, str]]:
        """
        Predict entities from text with trained model
        :param text: Text for the prediction

        :return: Predictions with the format [(0, 5, "label_1"), (7, 10, "label_2")]
        """
        sentence = Sentence(text)
        predicted_entities = []

        self.tagger.predict(sentence)

        for entity in sentence.get_spans("ner"):
            predicted_entities.append((entity.start_pos, entity.end_pos, entity.tag))

        return predicted_entities

    @staticmethod
    def load_model(path: Union[str, Path]):
        """
        Load a trained model
        :param path: Path to a .pt file

        :return: Object with the model loaded
        """
        flair_model = FlairModel()
        flair_model.tagger = SequenceTagger.load(path)

        return flair_model


class SpacyModel(NerModel):
    def __init__(self):
        self.model = None

    def train(
        self,
        train_data: List[Tuple],
        save_training: Union[str, Path],
        epochs: int = 50,
        learning_rate: float = 0.001,
        dropout: float = 0.2,
    ) -> None:
        """
        Train and test a spacy model and save all training logs in a directory
        :param train_data: train data with the format
        [("text", {'entities':[(0, 5, "label_1"), (7, 10, "label_2")]})]
        :param save_training: directory with all data, logs and trained models
        :param epochs: max number of epochs for training
        :param learning_rate: learning rate for training
        :param embedding: embedding to use ('fasttext' or 'bert')
        :param model_size: number of hidden states in RNN
        :param batch_size: size of batch during training
        """
        # https://spacy.io/api/cli#train-hyperparams
        os.environ["learn_rate"] = str(learning_rate)

        # cast string to Path
        if type(save_training) is str:
            save_training = Path(save_training)

        if os.path.exists(save_training):
            logging.error(f'"{save_training}" already exists')
            return
        else:
            os.mkdir(save_training)
            logging.info(f'"{save_training}" created')

        self.model = spacy.blank("fr")

        if "ner" not in self.model.pipe_names:
            ner = self.model.create_pipe("ner")
            self.model.add_pipe(ner, last=True)

        # add labels
        for _, annotations in train_data:
            for ent in annotations.get("entities"):
                ner.add_label(ent[2])

        training_log_path = os.path.join(save_training, "training.log")

        # get names of other pipes to disable them during training
        other_pipes = [pipe for pipe in self.model.pipe_names if pipe != "ner"]
        with open(training_log_path, "w", encoding="utf8") as f:
            with self.model.disable_pipes(*other_pipes):  # only train NER
                optimizer = self.model.begin_training()
                for epoch in range(epochs):
                    random.shuffle(train_data)
                    losses = {}
                    for text, annotations in train_data:
                        self.model.update(
                            [text],  # batch of texts
                            [annotations],  # batch of annotations
                            drop=dropout,  # dropout - make it harder to memorise data
                            sgd=optimizer,  # callable to update weights
                            losses=losses,
                        )
                    logging.info(f'Epoch {epoch}, loss : {losses["ner"]}')
                    f.write(f'Epoch {epoch}, loss : {losses["ner"]}')

        model_path = os.path.join(save_training, "model")
        self.model.to_disk(model_path)

    @staticmethod
    def load_model(path: Union[str, Path]):
        """Load a trained NER model

        :param path: Path and name of the saved object
        """
        ner = SpacyModel()
        ner.model = spacy.load(path)
        return ner

    def predict(self, text: str) -> List[Tuple[int, int, str]]:
        """
        Predict entities from text with trained model
        :param text: Text for the prediction

        :return: Predictions with the format [(0, 5, "label_1"), (7, 10, "label_2")]
        """
        predictions = self.model(text)

        predicted_entities = []

        for prediction in predictions.ents:
            predicted_entities.append(
                (prediction.start_char, prediction.end_char, prediction.label_)
            )

        return predicted_entities

    def save_model(self, path: Union[str, Path]):
        """Save the trained NER model

        :param path: Path and name of the model
        """

        self.model.to_disk(path)
