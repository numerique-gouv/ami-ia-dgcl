import express from 'express';
import DBManager from '@db-manager/index.js';
import logger from '@tools/logger';

class DashController {
    constructor() {
        this.path = '/dashboard';
        this.router = express.Router();
        this.initializeRoutes = this.initializeRoutes.bind(this);
        this.getDashboard = this.getDashboard.bind(this);
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.get(this.path, this.getDashboard);
    }

    getDashboard(req, res) {
        logger.info('Fetching statistique by scope');
        DBManager.getStatGlobal().then((result) => {
            logger.info('Successfully fetched statistique global');
            DBManager.getStatByDept().then((dept) => {
                res.json({
                    global: result[0],
                    dept: dept,
                });
                logger.info('Successfully fetched statistique by dept');
            }, (err) => {
                res.status(504).json({
                    error: 'cannot get statistique by dept',
                });
                logger.error('get stat by dept : ' + err);
            });
        }, (err) => {
            res.status(504).json({
                error: 'cannot get statistique global',
            });
            logger.error('get stat global : ' + err);
        });
    }
}

export { DashController };
