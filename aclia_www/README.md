# Welcome / @ctes webapp

## Description

Welcome ! @ctes is a NLP application , built with `Reactjs` and `NodeJs`.

## Getting started

### Architecture

Since it's a JS-Based project, due to ReactJs & express the repo is split in 3 parts:
  ```bash
  - webApp
  - API
  - Docker solution
  ```

- client: Everything you need to run and develop the reactjs webapp

---
- server:
    Everything you need to run and develop the express/Nodejs API.
---
- Docker:
    Everything you need to run and develop webapp, api and postgresql

### Run it

Please refer to the corresponding README

server :
```bash
cd server && cat README.md
```

client:
```bash
cd client && cat README.md
```

docker:
```bash
TODO
```

**NOTE :**
```bash
before running the server and the client please make sure to :
1. setup the file "default.json" in 'actes-webapp/server.config' to point to your local postgresql DB
2. If you want to point to the production DB make sure to have the
   Starclay VPN connect.

by default the file point to the production DB.
```

### Deployment

Please read [DEPLOYMENT](./client/docs/DEPLOYMENT.md) for details on our deployment process on the ASN server.
**NOTE :**
```bash
WIP
```

## Documentation

if you want to know everything about the application please refer to the client or server documentation.

## Contributing

Please read [CONTRIBUTING](./client/docs/CONTRIBUTING.md) for details on our code of conduct, and the process for pushing new features/patch

## Versioning

```bash
gitlab.starclay.fr
```

## Authors

* **Junique Virgile** - *Initial contributor* - [Junique Virgile](https://github.com/werayn)

## License

This project is completely private.
