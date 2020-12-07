/* eslint-disable camelcase */
import { Pool } from 'pg';
import Config from 'config';
import Queries from '@queries/index.js';
import logger from '@tools/logger.js';

class DBManager {
    constructor() {
        this.init();
    }
    //Init connection to datbase
    async init(){
        logger.debug('Initializing database connection with %s', JSON.stringify(Config.get('db')));
        this.pool = new Pool(Config.get('db'));

        await this.pool.connect();
    }

    runQuery(query, params) {
        return this.pool.query(query, params);
    }
    //Validation

    async getValidationList() {
        const result = await this.runQuery(Queries.get('getValidationList'));
        return result.rowCount === 0 ? null : result.rows;
    }

    async getActe(noacte) {
        const result = await this.runQuery(Queries.get('getActe'), [noacte]);
        return result.rowCount === 0 ? null : result.rows;
    }
    //Record
    async getRecordList(params) {
        const result = await this.runQuery(Queries.get('getRecordList'), [Number(JSON.parse((params.statut)))]);
        return result.rowCount === 0 ? null : result.rows;
    }

    async getRecordListAnnoted() {
        const result = await this.runQuery(Queries.get('getRecordListAnnoted'));
        return result.rowCount === 0 ? null : result.rows;
    }

    async getRecordListNotAnnoted() {
        const result = await this.runQuery(Queries.get('getRecordListNotAnnoted'));
        return result.rowCount === 0 ? null : result.rows;
    }

    async getRecord({docId, filename}) {
        const result = await this.runQuery(Queries.get('getRecord'), [docId, filename]);
        return result.rows;
    }

    async getPJList(params) {
        const result = await this.runQuery(Queries.get('getPJList'), [params.filename, params.docId]);
        return result.rows;
    }

    async getAnnotationsJSON({docId, filename}) {
        const result = await this.runQuery(Queries.get('getAnnotations'), [docId, filename]);
        return result.rowCount === 0 ? null : result.rows;
    }

    async getAnnotation(id) {
        const result = await this.runQuery(Queries.get('getAnnotation'), [id]);
        return result.rows;
    }

    async deleteAnnotation(codeSuprresion) {
        const result = await this.runQuery(Queries.get('deleteAnnotation'), [codeSuprresion]);
        return result.rows;
    }

    async setAnnotation({docId,nom_lettre,selectedTerm,categorie,sousCategorie,selectedTermStart,selectedTermEnd,user,scope}) {
        const result = await this.runQuery(Queries.get('setAnnotation'), [docId,nom_lettre,selectedTerm,categorie,sousCategorie,selectedTermStart,selectedTermEnd,user,scope]);
        return result.rows;
    }

    async setAnnotationStep({step, filename, docId}) {
        const result = await this.runQuery(Queries.get('setAnnotationStep'), [step, filename, docId ]);
        return result.rowCount === 0 ? null : step;
    }

    async setAnnotationsJSON({username, qcm, docId, filename}) {
        const result = await this.runQuery(Queries.get('setAnnotations'), [username, qcm, docId, filename]);
        return result.rowCount === 0 ? null : qcm;
    }

    async setStatut( {statut, docId, filename} ) {
        const result = await this.runQuery(Queries.get('updateStatut'), [ statut, filename, docId]);
        return result.rowCount === 0 ? null : statut;
    }

    async setMainLetter( {docId, filename, statut} ) {
        const result = await this.runQuery(Queries.get('setMainLetter'), [ filename, docId, statut]);
        return result.rowCount === 0 ? null : {docId, filename, statut};
    }

    async setPJListMainLetter( {oldFilename, newFilename} ) {
        const result = await this.runQuery(Queries.get('updatePJListeMainLetter'), [ newFilename, oldFilename ]);
        return result.rowCount === 0 ? null : newFilename;
    }

    async setValidationRapport( docId ) {
        const result = await this.runQuery(Queries.get('setValidationRapport'), [ docId]);
        return result.rows;
    }


    //Dashboard
    async getStatGlobal() {
        const ret = await this.runQuery(Queries.get('getMetrics'));
        return ret.rows;
    }

    async getStatByDept() {
        const ret = await this.runQuery(Queries.get('getDept'));
        return ret.rows;
    }

    //Auth Users
    async getUser(username, password) {
        const result = await this.runQuery(Queries.get('getUser'), [username, password]);
        return result.rows;
    }

    async setUserLogStory(user ) {
        await this.runQuery(Queries.get('setUserLogStory'), [user]);
    }
}

export default new DBManager();
