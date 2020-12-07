"""
utils.py
====================================
Module to manage PDF files
"""

import glob
import logging
import os
import re
import tarfile

from tqdm import tqdm

import psutil
import py7zr
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor

PHYSICAL_CORES = psutil.cpu_count(logical=False)

def get_file_paths(path, recursive = False, extension = '.pdf'):
    """Returns paths for all the files contained in the folder
    
    :param path: Path to the folder
    :param recursive: if True, will look for pdf files in directory and subdirectories 
    :param extension: Extension that files need to have
    :returns: A list with the paths to all files with a specific extension in the folder
    """
    
    pattern = os.path.join(path, '**')

    path_list = glob.glob(pattern, recursive = recursive)
    
    pdf_list = [elt for elt in path_list if os.path.splitext(elt)[1].lower() == extension]
    
    return pdf_list

def multithreading(arr, func, workers=4):
    """Applies function to array with multithreading
    
    :param arr: List or np.ndarray
    :param func: Function applied to the array
    :param workers: Number of threads in the pool
    :returns: List with the function applied to each element of the input list
    """
    with ThreadPoolExecutor(workers) as ex:
        res = list(tqdm(ex.map(func, arr), total=len(arr)))
    return list(res)

def multiprocessing(arr, func, workers=-1):
    """Applies function to array with multiprocessing
    
    :param arr: List or np.ndarray
    :param func: Function applied to the array
    :param workers: Number of processes in the pool, by default uses the maximum number of cores - 1
    :returns: List with the function applied to each element of the input list
    """
    
    if workers == -1:
        workers = PHYSICAL_CORES - 1
        
    with ProcessPoolExecutor(workers) as ex:
        res = list(tqdm(ex.map(func, arr), total=len(arr)))
    return list(res)

def unzip(input_path, output_path=None):
    """Unzip a compressed folder
    
    :param input_path: Path to the compressed folder
    :param output_path: Path where to uncompress the folder 
    (default will uncompress in the same folder with the same name as the compressed file)
    :returns: True if the folder was unzipped successfully, False otherwise
    """
    
    if not os.path.exists(input_path):
        logging.warning('Path to zip file does not exist')
        return False

    if input_path.endswith('.tar.gz'):
    
        if output_path is None:
            output_path = re.sub('\.tar\.gz$', '', input_path)
    
        with tarfile.open(input_path, "r:gz") as tfile:
            tfile.extractall(output_path)
            
    elif input_path.endswith('.7z'):
        if output_path is None:
            output_path = re.sub('\.7z$', '', input_path)
    
        with py7zr.SevenZipFile(input_path, mode='r') as zfile:
            zfile.extractall(output_path)
            
    else:
        logging.warning('Not a zip file')
        return False
    
    return True

def get_folder(path):
    """Get the folder where the file is
    
    :param path: Path to the file
    :returns: Folder name where the file is
    """
    
    return os.path.split(os.path.dirname(path))[1]

def remove_extension(path):
    """Removes the extension of the file
    
    :param path: Path to the file 
    :returns: Path without the extension
    """
    if path.endswith('.tar.gz'):
        return re.sub('\.tar\.gz$', '', path)
    else:
        return os.path.splitext(path)[0]
