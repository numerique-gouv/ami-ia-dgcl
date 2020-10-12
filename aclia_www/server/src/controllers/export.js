import express from 'express';
import DBManager from '@db-manager/index.js';
import logger from '@tools/logger';
import _ from 'lodash';
import excel from 'node-excel-export';
import { specificationSearch, specificationPara, specification } from '@tools/schemaExcel.js';

class exportController {
    constructor() {
        this.path = '/export';
        this.router = express.Router();
        this.initializeRoutes = this.initializeRoutes.bind(this);
        this.getExport = this.getExport.bind(this);
        this.getExportPara = this.getExportPara.bind(this);
        this.getExportSearch = this.getExportSearch.bind(this);
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.post(`${this.path}/csv/stat`, this.getExport);
        this.router.post(`${this.path}/csv/para`, this.getExportPara);
        this.router.post(`${this.path}/csv/search`, this.getExportSearch);
    }

    getExportPara(req, res) {
        const { toExport } = req.body;
        logger.info('Creating file to export');
        DBManager.getRecord(toExport.id_lettre).then((result) => {
            logger.info('Successfully Fetching letter');
            const paras = _.split(result[0].lettre, '######');
            const cate = toExport.cat;
            const finalData = paras.map((elem, occur) => {
                elem = elem.replace(/###/g, ' ');
                const categorie = [];
                _.forEach(cate, el => {
                    _.forEach(el.paragraphe, para => {
                        if (para.id_para - 1 === occur) {
                            const tmp = el.categorie + ' - ' + el.sous_categorie;
                            categorie.push(tmp);
                        }
                    });
                });
                if (categorie.length === 0) {
                    const tmp = 'Aucun concept / sous-concept détecté';
                    categorie.push(tmp);
                }
                return ({
                    categorie: categorie,
                    para: elem,
                });
            });
            const report = excel.buildExport(
                [ // <- Notice that this is an array. Pass multiple sheets to create multi sheet report
                    {
                        name: 'Report', // <- Specify sheet name (optional)
                        merges: [], // <- Merge cell ranges
                        specification: specificationPara, // <- Report specification
                        data: finalData, // <-- Report data
                    },
                ]
            );
            logger.info('csv ready and sent');
            return res.send(report);
        }, (err) => {
            res.status(500).json({
                error: 'cannot get record or export build error',
            });
            logger.error('getExportPara error :' + err);
        });

    }

    getExport(req, res) {
        const { toExport } = req.body;
        logger.info('Creating file to export');
        const report = excel.buildExport(
            [ // <- Notice that this is an array. Pass multiple sheets to create multi sheet report
                {
                    name: 'Report', // <- Specify sheet name (optional)
                    merges: [], // <- Merge cell ranges
                    specification: specification, // <- Report specification
                    data: toExport.cat, // <-- Report data
                },
            ]
        );
        if (report) {
            logger.info('csv ready and sent');
            return res.send(report);
        } else {
            res.status(500).json({
                error: 'cannot get data in export',
            });
            logger.error('exported stat letter error.');
        }
    }

    getExportSearch(req, res) {
        const { toExport, toTag } = req.body;
        logger.info('Creating file to export');
        const finalTab = [];
        _.forEach(toExport, elem => {
            finalTab.push(elem._source);
        });
        const finalTag = [];
        _.forEach(toTag, elem => {
            finalTag.push(elem.toString());
        });
        const heading = [
            finalTag, // <-- It can be only values
        ];
        const report = excel.buildExport(
            [ // <- Notice that this is an array. Pass multiple sheets to create multi sheet report
                {
                    name: 'Report', // <- Specify sheet name (optional)
                    heading: heading, // <- Raw heading array (optional)
                    merges: [], // <- Merge cell ranges
                    specification: specificationSearch, // <- Report specification
                    data: finalTab, // <-- Report data
                },
            ]
        );
        if (report) {
            logger.info('csv ready and sent');
            return res.send(report);
        } else {
            res.status(500).json({
                error: 'cannot get data in export',
            });
            logger.error('exported stat letter error.');
        }
    }
}

export { exportController };
