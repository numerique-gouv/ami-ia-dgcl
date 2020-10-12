import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '../../'))

import utils, extract
import unittest
import logging 
import shutil
import pandas as pd

logging.basicConfig(level=logging.ERROR)

class UtilsTest(unittest.TestCase):
    
    def setUp(self):
        self.data_dir = os.path.join(os.path.dirname(__file__), 'data')
        
    def test_get_file_paths(self):
        paths = utils.get_file_paths(self.data_dir)
        self.assertIn(os.path.join(self.data_dir, 'PDF_Acte_Image.PDF'), paths)
        self.assertIn(os.path.join(self.data_dir, 'PDF_Acte_Text.PDF'), paths)
        self.assertIn(os.path.join(self.data_dir, 'PDF_Image.PDF'), paths)
        self.assertIn(os.path.join(self.data_dir, 'PDF_Text.PDF'), paths)
        
    def test_multiprocessing(self):
        paths = utils.get_file_paths(self.data_dir)
        
        multiprocessing_res = utils.multiprocessing(paths, extract.text_from_pdf)
        sequential_res = [extract.text_from_pdf(path) for path in paths]
        self.assertEqual(multiprocessing_res, sequential_res)
        
    def test_multithreading(self):
        paths = utils.get_file_paths(self.data_dir)
        
        multithreading_res = utils.multithreading(paths, extract.text_from_pdf)
        sequential_res = [extract.text_from_pdf(path) for path in paths]
        self.assertEqual(multithreading_res, sequential_res)
        
    def test_unzip_targz(self):
        compressed_dir = os.path.join(self.data_dir, 'documents-AR-actes_DPT30_20180109_20180113.tar.gz')
        uncompressed_dir = os.path.join(self.data_dir, 'documents-AR-actes_DPT30_20180109_20180113')
        
        if os.path.exists(uncompressed_dir):
            shutil.rmtree(uncompressed_dir)
            
        utils.unzip(compressed_dir)
        
        self.assertTrue(os.path.exists(uncompressed_dir))
        self.assertEqual(len(os.listdir(uncompressed_dir)), 1)
        
        shutil.rmtree(uncompressed_dir)
        
    def test_unzip_7z(self):
        compressed_dir = os.path.join(self.data_dir, 'DONNEES_PROJET_ACLIA.7z')
        uncompressed_dir = os.path.join(self.data_dir, 'DONNEES_PROJET_ACLIA')
        
        if os.path.exists(uncompressed_dir):
            shutil.rmtree(uncompressed_dir)
            
        utils.unzip(compressed_dir)
        
        self.assertTrue(os.path.exists(uncompressed_dir))
        self.assertEqual(len(os.listdir(uncompressed_dir)), 1)
        
        shutil.rmtree(uncompressed_dir)
        
    def test_unzip_incorrect_path(self):
        self.assertFalse(utils.unzip(os.path.join(self.data_dir, 'not_a_dir.tar.gz')))
        
    def test_get_folder(self):
        self.assertEqual(utils.get_folder(os.path.join(self.data_dir, 'PDF_Acte_Text.PDF')), 'data')
        
    def test_remove_extension(self):
        zip_path = 'compressed_dir.7z'
        self.assertEqual(utils.remove_extension(zip_path), 'compressed_dir')
        
        targz_path = 'compressed_dir.tar.gz'
        self.assertEqual(utils.remove_extension(targz_path), 'compressed_dir')

        
if __name__ == "__main__":
    unittest.main()