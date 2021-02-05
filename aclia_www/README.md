# Welcome / @CTES-IA

## Description

Welcome ! @ctes-ia is a NLP application built for the Direction Generale des Collectivités Locales (DGCL) adminstration. It uses `Reactjs` and `NodeJs`. Today, it integrates an annotation feature and a feature for the validation of algorithms predictions...

## Getting started

### Prerequisites

#### IDE

You can choose the IDE you whant, but you need to have some packages installed with it like `ESLint` for the live linter, and some `React` packages to get autocompletion, ...
Here an exemple of the needed packages with Visual Studio Code IDE:

- `Reactjs code snippets`
- `ESLint`

#### Node / Npm / Yarn

Since it's a JS-Based project, due to ReactJs & express you need to install some stuff on your computer:

- NodeJS verion >=10.6
- Npm version >= 6.9
- macOS:
  Install [Homebrew](https://brew.sh) as package manager and install the following dependencies:

```bash
brew install node
brew install npm
```
---
- Windows:
  Note that you can't run iOS app on windows.
  Install [Chocolatey](https://chocolatey.org) as package manager and install the following dependencies:

```bash
choco install -y nodejs.install python2 jdk8 npm
```
---
- Linux:
  Follow the [install instructions for your linux distribution](https://nodejs.org/en/download/package-manager/) to install Node 8 or newer and npm.
---
- Yarn:
```bash
npm install -g yarn
```

### Install the project

First you need to clone the repository.
  Do not forget to upload your SSH Key into gitlab and having the right access.

```bash
git clone https://gitlab.starclay.fr/ms9/dgcl/actes-webapp
```

```bash
cd actes-webapp/client && yarn && cd ../server && yarn
```

### Run it

When everything is installed, if you want to run it, do the following:

server :
```bash
yarn start:dev
```

client on linux:
```bash
yarn start
```

**NOTE :**
```bash
ask the .env to your product owner
before running the server and the client please make sure to :
1. setup the file ".env"
2. If you want to point to the production DB make sure to have the good right.

by default the file point to the production DB.
```

### Test it

when everything is installed and run well, if you want to run every unit tests, do the following inside the good folder:

client or server :
```bash
yarn test
```

## Application operation and relation with the aclia_data project
Please read [projet_aclia_outil_annotation_documentation_technico_fonctionnelle](./docs/projet_aclia_outil_annotation_documentation_technico_fonctionnelle_v1.docx) on sections "Finalité et fonctionnement de l’application" and "Description des tables utilisées par l’application".


## Deployment

Please read [projet_aclia_outil_annotation_documentation_technico_fonctionnelle](./docs/projet_aclia_outil_annotation_documentation_technico_fonctionnelle_v1.docx) on section "Déploiement".

## Technical documentation

if you want to know everything about the application just run inside the good folder (client or server):

```bash
yarn doc 
```

## Contributing

Please read [CONTRIBUTING](CONTRIBUTING.md) for details on our code of conduct, and the process for pushing new features/patch

## Authors

* **Junique Virgile** - *Initial contributor* - [Junique Virgile](https://github.com/werayn)
* **Joseph Assu Ondo** [Joseph Assu Ondo](https://www.linkedin.com/in/joseph-assu-ondo-53249298)

## License

This project is private.
