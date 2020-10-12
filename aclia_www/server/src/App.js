import express from 'express';
import Config from 'config';
import bodyParser from 'body-parser';
import cors from 'cors';
import fs from 'fs';
import https from 'https';
// Tools
import logger from '@tools/logger';
import { isDev } from '@tools/env';
// Middleware
import { loggerMiddleware } from '@middleware/logger.middleware.js';
// Controller
import { AuthController } from '@controllers/auth';
import { DashController } from '@controllers/dashboard';
import { RecordController } from '@controllers/record';
//import { exportController } from '@controllers/export';

class App {

    constructor() {
        this.app = express();
        this.controllers = [
            //            new exportController(),
            new AuthController(),
            new DashController(),
            new RecordController(),
        ];
        this.initializeMiddlewares = this.initializeMiddlewares.bind(this);
        this.initializeControllers = this.initializeControllers.bind(this);
        this.initializeMiddlewares();
        this.initializeControllers();
    }

    listen() {
        if (isDev()) {
            this.app.listen(Config.port, () => {
                logger.info('/*************** *************** ***************/');
                logger.info('/*************** STARTING SERVER ***************/');
                logger.info('/*************** *************** ***************/');
                logger.info(`App listening HTTP on the port ${Config.port}`);
            }).on('error', (err) => {
                logger.error(err);
                process.exit(1);
            });
        } else {
            const httpsServer = https.createServer({
                key: fs.readFileSync('/etc/letsencrypt/live/dgcl-aclia.starclay.fr/privkey.pem', 'utf8'),
                cert: fs.readFileSync('/etc/letsencrypt/live/dgcl-aclia.starclay.fr/fullchain.pem', 'utf8'),
            }, this.app);
            httpsServer.listen(Config.port, () => {
                logger.info('/*************** *************** ***************/');
                logger.info('/*************** STARTING SERVER ***************/');
                logger.info('/*************** *************** ***************/');
                logger.info(`App listening HTTPS on the port ${Config.port}`);
            }).on('error', (err) => {
                logger.error(err);
                process.exit(1);
            });
        }
    }

    initializeMiddlewares() {
        this.app.use(cors());
        this.app.use(bodyParser.json({limit: '50mb', extended: true}));
        this.app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
        this.app.use(loggerMiddleware);
    }

    initializeControllers() {
        this.app.get('/api', (req, res) => {
            res.send('Hello in @ctes api !');
        });
        this.controllers.forEach((controller) => {
            this.app.use('/api/', controller.router);
        });
        this.app.get('*', (req, res) => {
            res.send('404 Not Found');
        });
    }

}

export { App };
