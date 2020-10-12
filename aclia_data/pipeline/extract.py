"""
extract.py
====================================
Module to extract text from PDF files
"""

import PyPDF2
from PIL import Image
Image.MAX_IMAGE_PIXELS = 1000000000

import logging
import os

import numpy as np

import cv2
import pytesseract
import utils
from deskew import determine_skew
from pdf2image import convert_from_path
from tika import parser

logging.basicConfig(format='%(asctime)s %(levelname)s:%(message)s', level = logging.INFO)

# config the tesseract exe
import configparser
import platform
config = configparser.ConfigParser()
conf_file_path = os.path.join(os.path.dirname(__file__), '../config/Config.cfg')
config.read(conf_file_path)
tesseract_exec_path = config.get('Details', 'Tesseract')
if platform.system() == 'Windows':
    pytesseract.pytesseract.tesseract_cmd = tesseract_exec_path
# end config

def deskew_img(img):
    """Deskew image
    
    :param img: img to be deskewed
    :returns: img with the correct rotation
    """
    img_gray = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2GRAY)
    angle = determine_skew(img_gray)
    if angle == 0 or angle is None:
        return img
    else:
        img_rotate = img.rotate(angle, fillcolor = (255,255,255))
        return img_rotate

def text_from_pdf_image(path, deskew=False):
    """Extracts text from a pdf image
    
    :param path: Path to the pdf image file
    :returns: A String corresponding to the text in the PDF 
    """
    
    if not os.path.isfile(path) or path.split('.')[-1].lower() != 'pdf':
        logging.warning('Not a valid path')
        return None
    
    images = convert_from_path(path)
    if deskew:
        images = [deskew_img(img) for img in images]
        
    text = '\n\n'.join([pytesseract.image_to_string(img, lang='fra') for img in images])
    
    return text
    
def text_from_pdf_text(path):
    """Extracts text from a pdf text
    
    :param path: Path to the pdf text file
    :returns: A String corresponding to the text in the PDF 
    """
    
    if not os.path.isfile(path) or path.split('.')[-1].lower() != 'pdf':
        logging.warning('Not a valid path')
        return None
    
    file_data = parser.from_file(path)
    text = file_data['content']
    
    if text is None:
        return ''
    else:
        return text

def get_metadata_pdf(path):
    """Return the metadata from the pdf file
    
    :param path: Path to the pdf file
    :returns: A tuple containing the type of pdf (image/text), producer, creation_date, number of pages in the pdf, number of files (acte + pj), name of the acte principal
    """
    
    try:
        metadata = PyPDF2.PdfFileReader(path, strict=False)
        type_pdf = 'text' if '/Font' in metadata.getPage(0)['/Resources'] else 'image'
    except:
        return (None, None, None, None, None, None)
    
    producer = None
    creation_date = None
    
    if metadata.getDocumentInfo() is not None:
        metadata_keys = list(metadata.getDocumentInfo().keys())

        if '/Producer' in metadata_keys:
            producer = metadata.getDocumentInfo()['/Producer'].replace("\x00", "")
        if '/CreationDate' in metadata_keys:
            raw_date = metadata.getDocumentInfo()['/CreationDate']
            creation_date = raw_date[8:10] + '/' + raw_date[6:8] + '/' + raw_date[2:6]
        
    num_pages = metadata.getNumPages()
    num_files = len(os.listdir(os.path.dirname(path)))
    
    pj_acte_principal = get_acte_principal(path)
    
    return (type_pdf, producer, creation_date, num_pages, num_files, pj_acte_principal)

def get_acte_principal(path):
    """Return the filename of the acte principal
    
    :param path: Path to the pdf file
    :returns: filename of the acte principal
    """
    
    file_nb = utils.remove_extension(os.path.basename(path)).split('_')[-1]
    
    pj_acte_principal = None
    
    if file_nb != '1':
        for file in utils.get_file_paths(os.path.dirname(path)):
            filename = os.path.basename(file)
            if utils.remove_extension(filename).split('_')[-1] == '1':
                pj_acte_principal = filename
    else:
        pj_acte_principal = None
    
    return pj_acte_principal
    

def text_from_pdf(path):
    """Extracts text from a pdf
    
    :param path: Path to the pdf file
    :returns: A String corresponding to the text in the PDF 
    """
    
    try:
        is_text = '/Font' in PyPDF2.PdfFileReader(path, strict=False).getPage(0)['/Resources']
    except:
        logging.warning('Unable to read PDF')
        return None
    
    text = None
    
    if is_text: # PDF Text
        text = text_from_pdf_text(path)
        
    if not is_text or text == '': # PDF Image or PDF Text with no result
        text = text_from_pdf_image(path)
        
    return text