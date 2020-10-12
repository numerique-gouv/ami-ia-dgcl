import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '../../'))

import extract
import unittest
import logging 

logging.basicConfig(level=logging.ERROR)

class ExtractTest(unittest.TestCase):
    
    def setUp(self):
        self.data_dir = os.path.join(os.path.dirname(__file__), 'data')
    
    def test_text_from_pdf_text_with_acte(self):
        text = extract.text_from_pdf_text(os.path.join(self.data_dir, 'PDF_Acte_Text.PDF'))
        
        self.assertIsInstance(text, str)
        self.assertIn('EXTRAIT DU REGISTRE DES DELIBERATIONS DU CONSEIL MUNICIPAL', text)
        
    def test_text_from_pdf_text_with_incorrect_path(self):
        self.assertIs(extract.text_from_pdf_text(os.path.join(self.data_dir, 'NotAValidPath.PDF')), None)
        
    def test_text_from_pdf_image_with_acte(self):
        text = extract.text_from_pdf_image(os.path.join(self.data_dir, 'PDF_Acte_Image.PDF'))
        
        self.assertIsInstance(text, str)
        self.assertIn('Adjoint administratif territorial principal', text)
        
    def test_text_from_pdf_image_with_incorrect_path(self):
        self.assertIs(extract.text_from_pdf_image(os.path.join(self.data_dir, 'NotAValidPath.PDF')), None)
        
    def test_read_pdf_with_pdf_text(self):
        self.assertIn('Ceci est un test', extract.text_from_pdf(os.path.join(self.data_dir, 'PDF_Text.PDF')))
        
    def test_read_pdf_with_pdf_image(self):
        self.assertIn('Ceci est un test', extract.text_from_pdf(os.path.join(self.data_dir, 'PDF_Image.PDF')))
        
        
if __name__ == "__main__":
    unittest.main()