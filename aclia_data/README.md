
# Welcome / @ctes-Ia

## Description

Welcome ! @actes-ia is a NLP application that allows to :
- Annotate "actes"
- Classify the "nature" of an acte
- Classify the "matiere" and its level (level 1 and 2)
- Retrieve named entities (action, finalité, contexte, ...) from the acte to check the correctness of the metadata "objet"
- Tell if an acte can be "transmissible" or not

The actes-ia-data is the part of the project that contains treatments about :
- OCR pipeline
- Meta data agregation
- Data generation for the annotation tool
- IA treatment

## Getting started

### Install the project

First you need to clone the repository.
  Do not forget to upload your SSH Key into gitlab and having the right access.

```bash
git clone git@gitlab.starclay.fr:ms9/dgcl/actes-ia-data.git
```

Add the path to this project path/to/actes-ia-data in the PYTHONPATH environment variable 

To configurate the access to the database, create a file ConfigSQL.cfg in the config/ directory and add the following information:

```bash
[postgresql]
PG_ACCESS_USER = <user>
PG_ACCESS_PASS = <pass>
PG_ACCESS_HOST = <host>
PG_ACCESS_PORT = <port>
PG_ACCESS_DBNAME = <dbname>

[email_infos]
sender = <sender@domain.com>
receivers:['receive1@domain.com', 'receive2@domain.com']
server = <mail.part.net>

```

### Prerequisites

Since it's a Python-Based project, you need to install some packages on your computer:

```bash
pip install -r requirements.txt
```

You will also need to install Tesseract an ocr library.

* Windows : 
    * [Tesseract-ocr](https://github.com/UB-Mannheim/tesseract/wiki)

To configurate pytesseract with french language, download __fra.traineddata__ from the pytesseract [github](https://github.com/tesseract-ocr/tessdata) and place it in __<path_to_Tesseract-OCR>/tessdata/__


#### IDE

The following IDE are installed with Anaconda

* Jupyter notebook
* Spyder


### Test it

when everything is installed and run well, if you want to run every unit tests, do the following:

```bash
python -m unittest discover -v
```

If you only want to run a single unit test, do the following:

```bash
python -m unittest <path_to_test> -v
```

### Run it
When everything is installed, if you want to run it, do the following:

#### OCR pipeline :
- Setup the [Config.cfg](config/Config.cfg) with the path to tesseract.exe if it is a Windows system.
```
Tesseract = <path_to_tesseract.exe>
```
- Setup the [ConfigSQL.cfg](config/ConfigSQL.cfg) with information relative to the database and email infos in case of failure when sending tables to the SQL database.
- Run the following python script after having changed the config file :
```
python pipeline/scripts/pipeline_on_data.py -d <path_to_data_directory> -m <path_to_metadata_directory>
```
- Specify a path with the -s flag to save the pipeline file
- Change the -b flag to True to send the created table to the database with the name _dw_actes_

#### AI algorithms :
- First, annotations can be imported with the config file [ConfigSQL.cfg](config/ConfigSQL.cfg) correctly setup
```
python ML/scripts/import_annotations.py -a <acte_table> -n <annotation_table>
```
- With the imported annotations, a model can be trained to classify nature / matiere level 1 / matiere level 2. The config used to train the model can be set in the config file [ConfigClassifier.cfg](config/ConfigClassifier.cfg)
```
python ML/scripts/train_classifier.py -d <path_to_dataset> -t <type_of_label> -s <path_for_trained_model>
```
- A model can also be trained to retrieve named entities in the acte. The config used to train the model can be set in the config file [ConfigNER.cfg](config/ConfigNER.cfg)
```
python ML/scripts/train_ner.py -d <path_to_dataset> -t <type_of_label> -s <path_for_trained_model>
```
- For "transmissibilité" predictions, the following script uses a set of rules to determine the label :
```
python ML/scripts/regles_transmissibilite.py -d <path_to_dataset>
```
- With the models trained, a table can be sent to the database with information about the metadata, the predictions and their confidence score and the acte itself
```
python ML/scripts/train_ner.py -d <path_to_dataset> -m <path_to_directory_with_trained_models> -n <table_name>
```
- Generation of wordclouds to visualize the results for the trained classifiers
```
python ML/scripts/train_ner.py -d <path_to_dataset> -t <type_of_label> -m <path_to_trained_model> -s <path_for_wordclouds>
```

### Technico-functional documentation
For a better understanding of the python treatments, please read :
- [projet_aclia_pipeline_data_documentation_technico_fonctionnelle](projet_aclia_pipeline_data_documentation_technico_fonctionnelle_v1.docx)
- [projet_aclia_traitements_IA_documentation_technico_fonctionnelle](projet_aclia_traitements_IA_documentation_technico_fonctionnelle_v1.docx)


## Technical documentation

The technical documentation is located inside **./docs/_build/pdf** or **./docs/_build/html**.

Please read [README](./docs/README.md) for details about the generation process of that documentation.

## Contributing

Please read [CONTRIBUTING](./docs/CONTRIBUTING.md) for details on our code of conduct, and the process for pushing new features/patch

## Authors

* **Starclay**
