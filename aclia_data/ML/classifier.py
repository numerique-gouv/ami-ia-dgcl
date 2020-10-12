import logging
import pickle

import numpy as np
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.model_selection import GridSearchCV, KFold, RandomizedSearchCV
from sklearn.pipeline import Pipeline, make_pipeline

import matplotlib.pyplot as plt
import seaborn as sn
from lime.lime_text import LimeTextExplainer

logging.basicConfig(format='%(asctime)s %(levelname)s:%(message)s', level = logging.INFO)

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
            logging.info(f'Train Accuracy : {np.mean(predictions == y)*100:.4f}%')

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
            
        return classification_report(y, predictions, labels=self.labels, digits=3, output_dict=True)
            
    def _plot_confusion_matrix(self, y_true, y_pred):
        cf_matrix = confusion_matrix(y_true, y_pred)

        sn.heatmap(cf_matrix, fmt='d', annot=True, cmap='Blues', xticklabels=self.labels, yticklabels=self.labels)

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
        exp = explainer.explain_instance(X, c.predict_proba, top_labels=1, num_features=num_features)
        
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
            logging.info('Trying to load an old model')
            labels = None
            
        clf = Classifier(model, vectorizer)
        clf.labels = labels

        return clf
    
    def train_with_search(self, X, y, params, n_splits=1, type_search='random'):
        """Train with multiple parameters
    
        :param X: Array of samples to train on
        :param y: Labels for the samples
        :param params: Dict of parameters for the search (prefix args with 'vectorizer__' or 'model__')
        :param n_splits: Splits the dataset into n_splits, 1 means no split
        :param type_search: 'random' for a random search, 'grid' for a grid search
        """
        clf = Pipeline([('vectorizer', self.vectorizer), ('model', self.model)])

        if n_splits>1:
            kf = KFold(n_splits=n_splits, random_state=42, shuffle=True)
        else:
            kf = [(slice(None), slice(None))]

        if type_search == 'random':
            clf_search = RandomizedSearchCV(clf, param_distributions = params, cv = kf, n_iter = 5, n_jobs = -1, return_train_score=True)
        elif type_search == 'grid':
            clf_search = GridSearchCV(clf, param_grid = params, cv = kf, n_jobs = -1, return_train_score=True)
            
        clf_search.fit(X, y)
        best_score = np.argmax(clf_search.cv_results_['mean_test_score'])
        mean_train_score = np.round(clf_search.cv_results_['mean_train_score'][best_score]*100, 4)
        mean_test_score = np.round(clf_search.cv_results_['mean_test_score'][best_score]*100, 4)

        logging.info(f'Cross validation train score : {mean_train_score}%')
        logging.info(f'Cross validation test score : {mean_test_score}%')
        return clf_search
