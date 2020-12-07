# Welcome / @ctes-Ia

## Description

Welcome ! @actes-ia is a NLP application ...

## Getting started

### Prerequisites

Since it's a Python-Based project, you need to install some pakages on your computer:

```bash
pip install -r requirements.txt
```

You will also need to install Tesseract an ocr library, and Ghostscript an image management library.

* Windows : 
    * [Tesseract-ocr](https://github.com/UB-Mannheim/tesseract/wiki)

Then, download and paste in the Tesseract-ocr folder the [fra.traineddata](https://github.com/tesseract-ocr/tessdata/blob/master/fra.traineddata) file that allows Tesseract to ocr french documents.


#### IDE

 TODO


### Install the project

First you need to clone the repository.
  Do not forget to upload your SSH Key into gitlab and having the right access.

```bash
git clone git@192.168.222.205:ms9/dgcl/actes-ia-data.git
```

Add the path to this project path/to/actes-ia-data in the PYTHONPATH environment variable 

To configurate pytesseract with french language, download __fra.traineddata__ from the pytesseract [github](https://github.com/tesseract-ocr/tessdata) and place it in __<path_to_Tesseract-OCR>/tessdata/__

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

### Run it


### Test it

when everything is installed and run well, if you want to run every unit tests, do the following:

```bash
python -m unittest discover -v
```

If you only want to run a single unit test, do the following:

```bash
python -m unittest <path_to_test> -v
```

## Documentation

if you want to know everything about the application just read :
[README](./docs/README.md)

## Contributing

Please read [CONTRIBUTING](./docs/CONTRIBUTING.md) for details on our code of conduct, and the process for pushing new features/patch

## Versioning

```bash
TODO
```

## Authors

* **Junique Virgile** - *Initial contributor* - [Junique Virgile](https://github.com/werayn)

## License

This project is completely private.
