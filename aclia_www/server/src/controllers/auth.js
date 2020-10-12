import express from 'express';
import logger from '@tools/logger';
import tokenManager from '@security/tokenManager.js';
import DBManager from '@db-manager/index.js';
import crypto from 'crypto-js';
import moment from 'moment-with-locales-es6';

class AuthController {
    constructor() {
        this.path = '/auth';
        this.router = express.Router();
        this.initializeRoutes = this.initializeRoutes.bind(this);
        this.auth = this.auth.bind(this);
        this.getRefreshToken = this.getRefreshToken.bind(this);
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.post(this.path, this.auth);
        this.router.post(`${this.path}/refresh`, this.getRefreshToken);
    }

    auth(req, res) {
        const {username, password} = req.body;
        logger.info('Trying to authenticate user');
        if (username && password) {
            DBManager
                .getUser(username, password)
                .then((result) => {
                    switch (result.length) {
                    case 0:
                        logger.error(`No user:${username} found`);
                        res.status(401).json({error: 'Mauvaise combinaison utilisateur / mot de passe'});
                        break;
                    case 1: {
                        const bytes = crypto.AES.decrypt(result[0].userin, 'we-play-with-data');
                        const expireDate = bytes.toString(crypto.enc.Utf8);
                        const expired = moment(expireDate, 'DD/MM/YYYY') < moment();

                        if (!expired) {
                            DBManager.setUserLogStory(username).then((ret) => {
                                logger.info('User log updated');
                            }).catch(error => {
                                logger.error("Erreur d'insert ! " + error);
                            });
                            logger.info('User found! Authenticating..');
                            res.status(200).json({
                                'token': tokenManager.tokenGenerator(username, password),
                                'text': 'Authentification réussi',
                                'username': result[0].user,
                                'userId': result[0].id,
                            });
                        } else {
                            res.status(401).json({error: 'Expiration de licence, Veuillez contacter votre administrateur'});
                        }
                        break;
                    }
                    default:
                        break;
                    }
                });
        } else {
            res.status(422).json({
                error: 'wrong params',
            });
            logger.error('wrong params : auth');
        }
    }

    getRefreshToken(req, res) {
        const {token} = req.body;
        logger.info('Trying to refresh token ');
        if (token) {
            res.status(200).json({
                'token': tokenManager.tokenRefresh(token),
                'text': 'Authentification réussi',
            });
        }
    }
}

export { AuthController };
