import spacy
import random
import logging
from spacy.gold import GoldParse
from spacy.scorer import Scorer

import copy
import numpy as np
import os
import re
from fuzzywuzzy import fuzz

logging.basicConfig(format='%(asctime)s %(levelname)s:%(message)s', level = logging.INFO)

class NER:
    
    def __init__(self):
        self.model = None
        
    @staticmethod
    def format_metadata_objet(data):
        """Format data to the spacy format
    
        :param data: annotations (list of dicts), the dict must have 'startpos', 'endpos' and 'categorie'
        """
        annotations = []

        for i, row in data.iterrows():
            entities = []
            for meta_obj in row['metaObjet']:
            #     if meta_obj['categorie'] == 'Destinaire':
            #         meta_obj['categorie'] = 'Destinataire'
                entities.append((meta_obj['startpos']-1, meta_obj['endpos'], meta_obj['categorie']))

            annotations.append((row['objetacte'], {'entities':entities}))

        annotations = NER._drop_overlapping_annotations(annotations)
        annotations = NER.trim_entity_spans(annotations)
        return annotations
    
    @staticmethod
    def format_metadata_corps(data, only_objet=False):
        """Format data to the spacy format
    
        :param data: annotations (list of dicts), the dict must have 'startpos', 'endpos' and 'concept'
        :param only_objet: If true, keeps only the annotations corresponding to the object
        """
        annotations = []

        for i, row in data.iterrows():
            entities = []
            for meta_obj in row['corps']:
                if only_objet and 'Objet' not in meta_obj['concept']:
                    continue
                entities.append((meta_obj['startpos']-1, meta_obj['endpos'], meta_obj['concept']))

            annotations.append((row['texte'], {'entities':entities}))

        annotations = NER._drop_overlapping_annotations(annotations)
        annotations = NER.trim_entity_spans(annotations)
        return annotations
        
    @staticmethod
    def _overlap_one_in_list(pos, list_pos):
        '''
        Tell wether pos (start, end) overlap at least one of the pos inside list_pos
        Return a boolean
        '''
        is_overlapping = False
        for pos_i in list_pos:
            is_overlapping =  NER._get_overlap(pos, pos_i)
            if is_overlapping:
                break
        return is_overlapping  

    @staticmethod
    def _drop_overlapping_annotations(data_set):
        '''
        For an entry of the data set (a paragraph and all the entities), 
        remove all entities that overlap others. For each overlapping, keep the first occurence
        =====================
        PARAMETERS
        data_set : Spacy formatted data for NER task. 
            All annotations in a paragraph must be sorted by (start,end).
        '''
        data_set_res = copy.deepcopy(data_set)
        nb_annotations_init = 0
        nb_annotations_kept = 0
        for i in range(len(data_set_res)): # iterate over paragraph annotated
            entry = data_set_res[i]     
            '''
            print(entry)
            print("i:", i)
            print("")
            '''
            nb_annotations_init += len(entry[1]['entities'])
            # keep annotations that doesn't overlap kept ones
            if len(entry[1]['entities']) != 0:
                list_kept_annotations = [entry[1]['entities'][0]] # initialize with the first annotation inside the paragraph 
                for i in range(1,len(entry[1]['entities'])):
                    annotation_current = entry[1]['entities'][i]
                    if not NER._overlap_one_in_list(annotation_current, list_kept_annotations):
                        list_kept_annotations.append(annotation_current)
                nb_annotations_kept += len(list_kept_annotations)
                entry[1]['entities'] = list_kept_annotations
        return data_set_res
    
    @staticmethod
    def trim_entity_spans(data: list) -> list:
        """Removes leading and trailing white spaces from entity spans.
    
        Args:
            data (list): The data to be cleaned in spaCy JSON format.
    
        Returns:
            list: The cleaned data.
        """
        invalid_span_tokens = re.compile(r'\s')
    
        cleaned_data = []
        for text, annotations in data:
            entities = annotations['entities']
            valid_entities = []
            for start, end, label in entities:
                valid_start = start
                valid_end = end
                while valid_start < len(text) and invalid_span_tokens.match(
                        text[valid_start]):
                    valid_start += 1
                while valid_end > 1 and invalid_span_tokens.match(
                        text[valid_end - 1]):
                    valid_end -= 1
                valid_entities.append([valid_start, valid_end, label])
            cleaned_data.append([text, {'entities': valid_entities}])
    
        return cleaned_data

    def train(self, data, iterations, dropout=0.2, lr=0.001):
        """Train the model with input data
    
        :param X: data with the spacy format
        :param iterations: Number of iterations for the training
        """
        # https://spacy.io/api/cli#train-hyperparams
        os.environ['learn_rate'] = str(lr)
        
        self.model = spacy.blank('fr')
        
        if 'ner' not in self.model.pipe_names:
            ner = self.model.create_pipe('ner')
            self.model.add_pipe(ner, last=True)

        # add labels
        for _, annotations in data:
             for ent in annotations.get('entities'):
                ner.add_label(ent[2])

        # get names of other pipes to disable them during training
        other_pipes = [pipe for pipe in self.model.pipe_names if pipe != 'ner']
        with self.model.disable_pipes(*other_pipes):  # only train NER
            optimizer = self.model.begin_training()
            for itn in range(iterations):
                random.shuffle(data)
                losses = {}
                for text, annotations in data:
                    self.model.update(
                        [text],  # batch of texts
                        [annotations],  # batch of annotations
                        drop=dropout,  # dropout - make it harder to memorise data
                        sgd=optimizer,  # callable to update weights
                        losses=losses)
                logging.info(f'Iteration {itn}, loss : {losses["ner"]}')

    def test_exact_match(self, data):
        """Score the model with input data and exact match
    
        :param data: data with the spacy format
        """
        scorer = Scorer()
        ent_count = {}
        
        # Compute score with scorer
        for input_, annot in data:
            doc_gold_text = self.model.make_doc(input_)
            gold = GoldParse(doc_gold_text, entities=annot['entities'])
            
            for ent in annot['entities']:
                if ent[2] in ent_count.keys():
                    ent_count[ent[2]] += 1
                else:
                    ent_count[ent[2]] = 1
                    
            pred_value = self.model(input_)
            scorer.score(pred_value, gold)
        
        # Save scores in a dictionary
        scores = {}
        
        total_count = 0
        for entity in scorer.scores['ents_per_type'].keys():
            score_ent = scorer.scores['ents_per_type'][entity]

            if entity not in ent_count.keys():
                count = 0
            else:
                count = ent_count[entity]
            total_count += count    
            
            scores[entity] = {'precision':round(score_ent["p"], 2),
                              'recall':round(score_ent["r"], 2),
                              'f1-score':round(score_ent['f'], 2),
                              'support':count}

        scores['total_score'] = {'precision':round(scorer.scores['ents_p'], 2),
                                 'recall':round(scorer.scores['ents_r'], 2),
                                 'f1-score':round(scorer.scores['ents_f'], 2),
                                 'support':total_count}
            
        return scores
          
    @staticmethod
    def _get_overlap(pos_1, pos_2):
        """
        Tell if pos 1 (start,end)  overlap pos 2 (start,end).
        ===========
        PARAMETERS
            pos_1 : a n-tuple where the two first elements are start position and end position
            pos_2 : a n-tuple where the two first elements are start position and end position
        ============
        Return a boolean
        """
        return max(0, min(pos_1[1], pos_2[1]) - max(pos_1[0], pos_2[0]))
            
    def test_fuzzy_match(self, data, ratio=80):
        """Score the model with input data and fuzzy match
    
        :param data: data with the spacy format
        :param ratio: ratio for the string intersection between the prediction and annotation (between 0 and 100)
        """
        labels, counts = np.unique([entity[2] for row in data for entity in row[1]['entities']], return_counts=True)

        ent_count_correct = {label:0 for label in labels}
        ent_count_predict = {label:0 for label in labels}
        ent_count_total = {label:count for label, count in zip(labels, counts)}

        # Save predictions
        for input_, annot in data:
            predicted_values = self.model(input_)
            
            for predicted_entity in predicted_values.ents:
                ent_count_predict[predicted_entity.label_] += 1
                for actual_entity in annot['entities']:
                    overlap = NER._get_overlap((predicted_entity.start_char, predicted_entity.end_char), (actual_entity[0], actual_entity[1]))
                    fuzz_ratio = fuzz.ratio(predicted_entity.text, input_[actual_entity[0]: actual_entity[1]])

                    if overlap > 0 and fuzz_ratio >= ratio and predicted_entity.label_ == actual_entity[2]:
                        ent_count_correct[actual_entity[2]] += 1
                    
        # Compute scores
        scores = {}
        
        for label, count in ent_count_total.items():

            pre = ent_count_correct[label]*100/ent_count_predict[label] if ent_count_predict[label] > 0 else 0
            rec = ent_count_correct[label]*100/ent_count_total[label]
            
            scores[label] = {'precision':round(pre, 2), 
                             'recall':round(rec, 2), 
                             'support':ent_count_total[label]}
            
        total_pre = round(sum(ent_count_correct.values()) * 100 / sum(ent_count_predict.values()), 2) if sum(ent_count_predict.values()) > 0 else 0
        total_rec = round(sum(ent_count_correct.values()) * 100 / sum(ent_count_total.values()), 2) if sum(ent_count_total.values()) > 0 else 0
        
        scores['total_score'] = {'precision':total_pre,
                                 'recall': total_rec,
                                 'support': sum(ent_count_total.values())}
            
        return scores
            
    def save_model(self, filename):
        """Save NER object

        :param filename: Path and name of the saved object
        """
        self.model.to_disk(filename)
        
    @staticmethod
    def load_model(filename):
        """Load a saved NER object

        :param filename: Path and name of the saved object
        """
        ner = NER()
        ner.model = spacy.load(filename)
        return ner
            