# Documentation
## Configurate workspace

Before generating documentation, the following libraries must be installed :

* sphinx (v1.6.5)
```bash
pip install sphinx==1.6.5
```

* rst2pdf (v0.96)
```bash
pip install rst2pdf==0.96
```

If a new module is created in the project, you need to specify its path to sphynx for the module to be considered in the documentation generation.
In docs/source/code.rst, add the following lines to the file :
```bash
.. automodule:: <path_to_module>
	:members:
```

## Generate documentation

Be sure to be in the docs/ folder before running the commands.

In case the already generated documentation is causing trouble, run the following command :

```bash
make clean
```

To generate the HTML files, run the following command :

```bash
make html
```

The output will be stored in docs/_build/html/

To generate the PDF files, rune the following command :

```bash
sphinx-build -b pdf . _build/pdf
```

The output will be stored in docs/_build/pdf/

