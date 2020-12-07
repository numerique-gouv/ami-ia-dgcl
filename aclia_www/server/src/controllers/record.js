/* eslint-disable camelcase */
import express from 'express';
import DBManager from '@db-manager/index.js';
import logger from '@tools/logger';
import url from 'url';
import queryString from 'query-string';

class RecordController {
    constructor() {
        this.path = '/record';
        this.router = express.Router();
        this.initializeRoutes = this.initializeRoutes.bind(this);
        this.getRecordList = this.getRecordList.bind(this);
        this.getPJList = this.getPJList.bind(this);
        this.getLetter = this.getLetter.bind(this);
        this.getLetterAnnotation = this.getLetterAnnotation.bind(this);
        this.deleteLetterAnnotation = this.deleteLetterAnnotation.bind(this);
        this.postLetterAnnotation = this.postLetterAnnotation.bind(this);
        this.postAnnotationstep = this.postAnnotationStep.bind(this);
        this.updateMainLetter = this.updateMainLetter.bind(this);
        this.updatePJListMainLetter = this.updatePJListMainLetter.bind(this);
        this.updateStatut = this.updateStatut.bind(this);
        this.postAnnotations = this.postAnnotations.bind(this);
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.get(`${this.path}/list`, this.getRecordList);
        this.router.get(`${this.path}/pj`, this.getPJList);
        this.router.get(`${this.path}/letter`, this.getLetter);
        this.router.get(`${this.path}/letter-annotation`, this.getLetterAnnotation);
        this.router.post(`${this.path}/delete-annotation`, this.deleteLetterAnnotation);
        this.router.post(`${this.path}/post-annotation`, this.postLetterAnnotation);
        this.router.post(`${this.path}/post-annotation-step`, this.postAnnotationStep);
        this.router.post(`${this.path}/update-main-letter`, this.updateMainLetter);
        this.router.post(`${this.path}/update-jplist-main-letter`, this.updatePJListMainLetter);
        this.router.post(`${this.path}/update-statut`, this.updateStatut);
        this.router.post(`${this.path}/post-annotations`, this.postAnnotations);
    }

    deleteLetterAnnotation(req, res) {
        logger.info(`Loading deleting annotation  ${docId}, ${selectedTerm}, ${sousCategorie}`);
        const {docId, selectedTerm, sousCategorie, codeSuppression } = req.body;

        if ( codeSuppression )  {
            DBManager.deleteAnnotation(codeSuppression).then(() => {
                logger.info(`Successfully deleting annotation  ${docId}, ${selectedTerm}, ${sousCategorie}`);
                logger.info(`Fetching annotation ${docId}`);
                DBManager.getAnnotation(docId).then((result) => {
                    logger.info(`Successfully Fetching annotation ${docId}`);
                    res.status(200).json({
                        annotation: result,
                    });
                }, (err) => {
                    res.status(500).json({
                        error: 'cannot get annotation',
                    });
                    logger.error('deleteAnnotation error :' + err);
                });
            }, (err) => {
                res.status(500).json({
                    error: 'cannot delete annotation',
                });
                logger.error('deleteAnnotation error :' + err);
            });
        } else {
            res.status(500).json({
                error: 'wrong params',
            });
            logger.error('wrong params post annotation');
        }
    }

    postAnnotationStep(req, res) {
        const data = req.body;
        DBManager.setAnnotationStep(data).then((result) => {
            logger.info(`Successfully Fetching annotation step ${data.docId}`);
            res.status(200).json({
                step: result,
            });
        }, (err) => {
            res.status(500).json({
                error: 'cannot post step',
            });
            logger.error('postAnnotationStep error :' + err);
        });
    }

    postAnnotations(req, res) {
        const data = req.body;
        DBManager.setAnnotationsJSON(data).then((result) => {
            logger.info(`Successfully Adding annotations from ${data.username}`);
            res.status(200).json(result);
        }, (err) => {
            res.status(500).json({
                error: 'cannot post annotations',
            });
            logger.error('postAnnotations error :' + err);
        });
    }

    updateStatut(req, res) {
        const data = req.body;
        DBManager.setStatut(data).then((result) => {
            logger.info(`Successfully Fetching statut letter ${data.docId}`);
            res.status(200).json(result);
        }, (err) => {
            res.status(500).json({
                error: 'cannot update statut',
            });
            logger.error('updateStatut error :' + err);
        });
    }

    updateMainLetter(req, res) {
        const data = req.body;
        DBManager.setMainLetter(data).then((result) => {
            logger.info(`Successfully Fetching main letter ${data.docId}`);
            res.status(200).json(result);
        }, (err) => {
            res.status(500).json({
                error: 'cannot update main letter',
            });
            logger.error('updateMainLetter error :' + err);
        });
    }

    updatePJListMainLetter(req, res) {
        const data = req.body;
        DBManager.setPJListMainLetter(data).then((result) => {
            logger.info(`Successfully Fetching PJList main letter ${data.newFilename}`);
            res.status(200).json(result);
        }, (err) => {
            res.status(500).json({
                error: 'cannot update pJList main letter',
            });
            logger.error('updatePJListMainLetter error :' + err);
        });
    }

    postLetterAnnotation(req, res) {
        const {docId, nom_lettre, selectedTerm, categorie, sousCategorie, selectedTermStart, selectedTermEnd, user } = req.body;
        logger.info(`loading post annotation  ${docId}, ${selectedTerm}, ${sousCategorie}`);

        if ( docId && nom_lettre && selectedTerm && categorie && sousCategorie && selectedTermStart && selectedTermEnd && user )  {
            DBManager.setAnnotation(req.body).then(() => {
                logger.info(`Successfully adding annotation  ${docId}, ${selectedTerm}, ${sousCategorie}`);
                logger.info(`Fetching all annotation ${docId}`);
                DBManager.getAnnotation(docId).then((result) => {
                    logger.info(`Successfully Fetching annotation ${docId}`);
                    if (result.length === 1) {
                        DBManager.setValidationRapport(docId).then((tmp) => {
                            logger.info(`Successfully adding true to letter ${docId}`);
                        }, (err) => {
                            logger.error('setValidationRapport error :' + err);
                        });
                    }
                    res.status(200).json({
                        annotation: result,
                    });
                }, (err) => {
                    res.status(500).json({
                        error: 'cannot get annotation',
                    });
                    logger.error('postAnnotation error :' + err);
                });
            }, (err) => {
                res.status(500).json({
                    error: 'cannot set annotation',
                });
                logger.error('postAnnotation error :' + err);
            });
        } else {
            res.status(500).json({
                error: 'wrong params',
            });
            logger.error('wrong params post annotation');
        }
    }

    getLetter(req, res) {
        logger.info('Fetching letter');
        const parsedUrl = url.parse(req.url);
        const params = queryString.parse(parsedUrl.query);

        if (params.docId && params.filename) {
            DBManager.getRecord(params).then((result) => {
                logger.info(`Successfully Fetching letter ${params.docId}`);
                res.status(200).json(result[0]);
            }, (err) => {
                res.status(500).json({
                    error: 'cannot get letter',
                });
                logger.error('getLetter error :' + err);
            });
        } else {
            res.status(500).json({
                error: 'wrong params',
            });
            logger.error('wrong params get letter');
        }
    }

    getLetterAnnotation(req, res) {
        logger.info('Fetching letter with annotation');
        const parsedUrl = url.parse(req.url);
        const params = queryString.parse(parsedUrl.query);
        if (params.docId && params.filename) {
            DBManager.getRecord(params).then((result) => {
                logger.info(`Successfully Fetching letter ${params.docId}`);
                DBManager.getAnnotationsJSON(params).then((result2) => {
                    logger.info(`Successfully Fetching annotation ${params.docId}`);
                    res.status(200).json({
                        letter: result[0],
                        annotations: result2 ? result2[0].qcm : null,
                        step: result[0].step,
                    });
                }, (err) => {
                    res.status(500).json({
                        error: 'cannot get annotation',
                    });
                    logger.error('getLetter error :' + err);
                });
            }, (err) => {
                res.status(500).json({
                    error: 'cannot get letter',
                });
                logger.error('getLetter error :' + err);
            });
        } else {
            res.status(500).json({
                error: 'wrong params',
            });
            logger.error('wrong params get letter');
        }
    }

    getRecordList(req, res) {
        const parsedUrl = url.parse(req.url);
        const params = queryString.parse(parsedUrl.query);

        if (params.statut) {
            logger.info('Fetching Record list');
            switch (params.statut) {
            case 'true' :
                DBManager.getRecordListAnnoted().then((result) => {
                    logger.info('Successfully Fetching RECORD');
                    res.status(200).json(result);
                }, (err) => {
                    res.status(500).json({
                        error: 'cannot get record',
                    });
                    logger.error('getRecordList error :' + err);
                });
                break;
            default:
                DBManager.getRecordListNotAnnoted().then((result) => {
                    logger.info('Successfully Fetching RECORD');
                    res.status(200).json(result);
                }, (err) => {
                    res.status(500).json({
                        error: 'cannot get record',
                    });
                    logger.error('getRecordList error :' + err);
                });
            }
        } else {
            res.status(500).json({
                error: 'wrong params',
            });
            logger.error('wrong params record List');
        }
    }

    getPJList(req, res) {
        const parsedUrl = url.parse(req.url);
        const params = queryString.parse(parsedUrl.query);

        if (params.docId && params.filename) {
            logger.info('Fetching PJ list');
            DBManager.getPJList(params).then((result) => {
                logger.info(`Successfully Fetching PJ List of ${params.docId}`);
                res.status(200).json(result);
            }, (err) => {
                res.status(500).json({
                    error: 'cannot get record',
                });
                logger.error('getPJList error :' + err);
            });
        } else {
            res.status(500).json({
                error: 'wrong params',
            });
            logger.error('wrong params pj List');
        }
    }
}

export { RecordController };
