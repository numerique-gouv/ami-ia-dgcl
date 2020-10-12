import re
import string

import unidecode
from nltk.corpus import stopwords
from nltk.stem.snowball import FrenchStemmer
from nltk.tokenize import word_tokenize

def remove_accents(text):
    return unidecode.unidecode(text)

def text_lowercase(text):
    return text.lower()

def keep_alphanumeric(text):
    pattern = re.compile('[\W_]+', re.UNICODE)
    return pattern.sub(' ', text)

def letters_only(text):
    return re.sub('[^a-zA-Z]+', ' ', text)

def remove_punctuation(text):
    punctuation = string.punctuation + '’—°€'
    for punct in punctuation:
        text = text.replace(punct, ' ')
    return text
    
def remove_digits(text):
    for digit in string.digits:
        text = text.replace(digit, ' ')
    return text

def tokenize(text):
    text = word_tokenize(text)
    return text

def remove_stopwords(text, stopwords=[]):
    text = [i for i in text if not i in stopwords]
    return text

def replace_entities(text, entities, token):
    entities_regex = r'\b' + entities[0] + r'\b'
    for ent in entities[1:]:
        entities_regex = entities_regex + r'|\b' + ent + r'\b'
        
    text = re.sub(entities_regex, token, text)
    return text

def load_stopwords(path):
    stopwords_list = []
    with open(path, 'r', encoding='utf8') as f:
        stopwords_list = set(stopwords.words('french') + f.read().split())
        stopwords_list = [remove_accents(sw) for sw in stopwords_list]
        # Remove dates (days + months)
    stopwords_list = stopwords_list + ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']
    stopwords_list = stopwords_list + ['janvier', 'fevrier', 'mars', 'avril', 'mai', 'juin', 'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'decembre']
    stopwords_list = stopwords_list + ['vu', 'republique', 'francais', 'francaise', 'mme', 'mmes', 'madame', 'mm', 'monsieur', 'mrs', 'cedex', 'article', 'present', 'presents', 'code', 'representee']
    return stopwords_list

def preprocessing(text, stemming=True, stopwords=[], proper_nouns_sw=[]):
    text = text.replace('€', 'euros')
    text = remove_accents(text)
    text = letters_only(text)
    text = text_lowercase(text)
    text = re.sub(r'\beur\b', 'euros', text)
    for proper_noun_list, proper_noun_token in proper_nouns_sw:
        text = replace_entities(text, entities=proper_noun_list, token=proper_noun_token)
    text = tokenize(text)
    text = remove_stopwords(text, stopwords=stopwords)
    text = ' '.join(text)
    
    if stemming:
        stemmer = FrenchStemmer()
        text = stemmer.stem(text)
        
    return text