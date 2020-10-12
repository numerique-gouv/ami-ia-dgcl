import fs from 'fs-sync';
import path from 'path';

const queries = {
    //User
    getUser: fs.read(path.join(__dirname, '/user/get-user.sql')),
    setUserLogStory: fs.read(path.join(__dirname, '/user/set-user-log-story.sql')),
    //Dashboard
    getMetrics: fs.read(path.join(__dirname, '/dashboard/get-metrics.sql')),
    getDept: fs.read(path.join(__dirname, '/dashboard/get-stat-dept.sql')),
    // Record
    // getRecordList: fs.read(path.join(__dirname, '/record/get-recordList.sql')),
    getRecordListAnnoted: fs.read(path.join(__dirname, '/record/get-recordList-annoted.sql')),
    getRecordListNotAnnoted: fs.read(path.join(__dirname, '/record/get-recordList-not-annoted.sql')),
    getRecord: fs.read(path.join(__dirname, './record/get-record.sql')),
    getPJList: fs.read(path.join(__dirname, '/record/get-pjList.sql')),
    // getAnnotation: fs.read(path.join(__dirname, './record/get-term-annote.sql')),
    // deleteAnnotation: fs.read(path.join(__dirname, './record/delete-annotation.sql')),
    // setAnnotation: fs.read(path.join(__dirname, './record/set-annotation.sql')),
    setValidationRapport: fs.read(path.join(__dirname, './record/set-validation-rapport.sql')),
    setAnnotationStep: fs.read(path.join(__dirname, './record/set-annotation-step.sql')),
    setMainLetter: fs.read(path.join(__dirname, './record/set-main-letter.sql')),
    updatePJListeMainLetter: fs.read(path.join(__dirname, './record/update-pjlist-main-letter.sql')),
    updateStatut: fs.read(path.join(__dirname, './record/set-statut.sql')),
    setAnnotations: fs.read(path.join(__dirname, './record/set-annotations.sql')),
    getAnnotations: fs.read(path.join(__dirname, './record/get-annotations.sql')),
};

export default {
    get: (queryName) => {
        return queries[queryName];
    },
};
