"""
classifier_model.py
================================================================
Module containing all functions relative to the classifier model
"""

import logging
import pickle

import matplotlib.pyplot as plt
import numpy as np
import seaborn as sn
from lime.lime_text import LimeTextExplainer
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.pipeline import make_pipeline

logging.basicConfig(format="%(asctime)s %(levelname)s:%(message)s", level=logging.INFO)


class Classifier:
    def __init__(self, model, vectorizer):
        """
        :param model: Sklearn or XGBoost model
        :param vectorizer: Sklearn vectorizer (sklearn.feature_extraction.text)
        """
        self.model = model
        self.vectorizer = vectorizer
        self.labels = None

    def train(self, X, y, verbose=False):
        """Train the model with input X and y

        :param X: Array of texts to train on
        :param y: Labels corresponding to the X values
        :param verbose: Show accuracy on training set
        """
        X = self.vectorizer.fit_transform(X)

        self.model = self.model.fit(X, y)
        self.labels = np.unique(y)

        if verbose:
            predictions = self.model.predict(X)
            logging.info(f"Train Accuracy : {np.mean(predictions == y)*100:.4f}%")

    def test(self, X, y, cf_matrix=False):
        """Test the model with input X and y

        :param X: Array of texts to predict
        :param y: Labels corresponding to the X values
        :param cf_matrix: plot confusion matrix
        """
        X = self.vectorizer.transform(X)

        predictions = self.model.predict(X)

        if cf_matrix:
            self._plot_confusion_matrix(y, predictions)

        return classification_report(
            y, predictions, labels=self.labels, digits=3, output_dict=True
        )

    def _plot_confusion_matrix(self, y_true, y_pred):
        cf_matrix = confusion_matrix(y_true, y_pred)

        sn.heatmap(
            cf_matrix,
            fmt="d",
            annot=True,
            cmap="Blues",
            xticklabels=self.labels,
            yticklabels=self.labels,
        )

        plt.xlabel("Predicted Labels")
        plt.ylabel("True Labels")
        plt.show()

    def predict(self, X, probas=False):
        """Predict all samples in X with the trained classifier

        :param X: Array of texts to predict
        :param probas: Returns an array of probabilities with each class for each prediction
        """
        c = make_pipeline(self.vectorizer, self.model)

        if probas:
            return c.predict_proba(X)
        else:
            return c.predict(X)

    def predict_with_lime(self, X, num_features=10):
        """Predict X and show the most useful features

        :param X: Text to predict
        :param num_features: Number of features to show
        """
        c = make_pipeline(self.vectorizer, self.model)

        explainer = LimeTextExplainer()
        exp = explainer.explain_instance(
            X, c.predict_proba, top_labels=1, num_features=num_features
        )

        label_pred = exp.available_labels()[0]

        return self.predict([X])[0], exp.as_list(label=label_pred)

    def save_model(self, filename):
        """Save Classifier object

        :param filename: Path and name of the saved object
        """
        with open(filename, "wb") as file:
            pickle.dump(self.model, file)
            pickle.dump(self.vectorizer, file)
            pickle.dump(self.labels, file)

    @staticmethod
    def load_model(filename):
        """Load a saved Classifier object

        :param filename: Path and name of the saved object
        """
        model = None
        vectorizer = None
        try:
            with open(filename, "rb") as file:
                model = pickle.load(file)
                vectorizer = pickle.load(file)
                labels = pickle.load(file)
        except EOFError:
            logging.info("Trying to load an old model")
            labels = None

        clf = Classifier(model, vectorizer)
        clf.labels = labels

        return clf
