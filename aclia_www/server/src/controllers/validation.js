import express from 'express';
import DBManager from '@db-manager/index.js';
import logger from '@tools/logger';
import url from 'url';
import queryString from 'query-string';

class ValidationController {
    constructor() {
        this.path = '/validation';
        this.router = express.Router();
        this.initializeRoutes = this.initializeRoutes.bind(this);
        this.getValidationList = this.getValidationList.bind(this);
        this.getActe = this.getActe.bind(this);
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.get(`${this.path}/list`, this.getValidationList);
        this.router.get(`${this.path}/acte`, this.getActe);
    }

    getActe(req, res) {
        logger.info('Fetching acte');
        const parsedUrl = url.parse(req.url);
        const params = queryString.parse(parsedUrl.query);

        if (params.noacte) {
            DBManager.getActe(params.noacte).then((result) => {
                if (result && result.length === 1) {
                    logger.info('Successfully fetched acte list' + params.noacte);
                    res.json({
                        acte: result[0],
                    });
                } else  {
                    res.status(404).json({
                        error: `${params.noacte} missing`,
                    });
                    logger.error('get acte missing' + params.noacte);
                }
            }, (err) => {
                res.status(504).json({
                    error: `cannot get acte ${params.noacte} missing or error`,
                });
                logger.error('get acte' + params.noacte + ' :' + err);
            });
        } else {
            res.status(422).json({
                error: 'Unprocessable Entity',
            });
            logger.error('wrong params get Acte');
        }
    }


    getValidationList(req, res) {
        logger.info('Fetching validation list');
        DBManager.getValidationList().then((result) => {
            logger.info('Successfully fetched validation list');
            res.json({
                list: result,
            });
        }, (err) => {
            res.status(504).json({
                error: 'cannot get validation list',
            });
            logger.error('get validation list error : ' + err);
        });
    }
}

export { ValidationController };
