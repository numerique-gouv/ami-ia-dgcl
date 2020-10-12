/* eslint-disable camelcase */
import * as ErrorActions from '../Error/actions.js';
import types from './constants.js';
import * as MeSelector from '../Me/selector.js';
import * as RecordSelector from '../record/selector.js';
import { Map } from 'immutable';

/**
 * @function getRecord
 * @desc This function send a get request to
 * get the letters statut and id.
 * @returns {object} the promise
 * @version 1.0
 * @since 1.0
 * @public
 */
export function getRecordList(statut) {
    return (dispatch, getState, { api }) => {

        return dispatch({
            type: types.RECORD,
            payload: api.getRecordList(statut),
        }).catch((err) => {
            ErrorActions.rejectPromiseWithLocalError(err.message);
        });
    };
}

/**
 * @function getPJList
 * @desc This function send a get request to
 * get the attachements letter nom_lettre, filename, acte_principal and documentId.
 * @returns {object} the promise
 * @version 1.0
 * @since 1.0
 * @public
 */
export function getPJList() {
    return (dispatch, getState, { api }) => {
        const state = getState();
        const tmpLetter = RecordSelector.getMainLetter(state);
        const letter = tmpLetter.toJS();

        return dispatch({
            type: types.PJ,
            payload: api.getPJList(letter.docId, letter.filename),
        }).catch((err) => {
            ErrorActions.rejectPromiseWithLocalError(err.message);
        });
    };
}

/**
 * @function getRecord
 * @desc This function send a get request to
 * get the letters statut and id.
 * @returns {object} the promise
 * @version 1.0
 * @since 1.0
 * @public
*/
export function getLetter() {
    return (dispatch, getState, { api }) => {
        const state = getState();
        const toAnnot = RecordSelector.getToAnnot(state);
        const tpmLetter = RecordSelector.getCurrentLetter(state);
        const letter = tpmLetter.toJS();

        if (toAnnot) {
            return dispatch({
                type: types.CURRENT_LETTER,
                payload: api.getCurrentLetter(letter.docId, letter.filename),
            }).catch((err) => {
                ErrorActions.rejectPromiseWithLocalError(err.message);
            });
        } else {
            return dispatch({
                type: types.CURRENT_LETTER_ANNOTATED,
                payload: api.getCurrentLetterAnnotation(letter.docId, letter.filename),
            }).catch((err) => {
                ErrorActions.rejectPromiseWithLocalError(err.message);
            });
        }
    };
}

/**
 * @function getRecord
 * @desc This function send a get request to
 * get the letters statut and id.
 * @returns {object} the promise
 * @version 1.0
 * @since 1.0
 * @public
 */
export function setIsMainLetter() {
    return (dispatch, getState, { api }) => {
        const state = getState();
        const letter = RecordSelector.getCurrentLetter(state).toJS();

        return dispatch({
            type: types.ADD_MAIN_LETTER,
            payload: api.getCurrentLetterAnnotation(letter.docId, letter.filename),
        }).then(res => {
            this.getPJList();
        }).catch((err) => {
            ErrorActions.rejectPromiseWithLocalError(err.message);
        });
    };
}

/**
 * @function getRecord
 * @desc This function send a get request to
 * get the letters statut and id.
 * @returns {object} the promise
 * @version 1.0
 * @since 1.0
 * @public
 */
export function clearLetter() {
    return (dispatch, _, { api }) => {

        return dispatch({
            type: types.CLEAR_LETTER,
        });
    };
}
/**
 * @function endAnnotation
 * @desc This function send a get request to
 * get the letters statut and id.
 * @returns {object} the promise
 * @version 1.0
 * @since 1.0
 * @public
 */
export function endAnnotation(statut) {
    return (dispatch, getState, { api }) => {
        const state = getState();
        const tpmLetter = RecordSelector.getLetter(state);
        const letter = tpmLetter.toJS();
        const toAnnot = RecordSelector.getToAnnot(state);

        return dispatch({
            type: types.END_ANNOT,
            payload: api.updateStatut({statut:statut, docId:letter.docId, filename:letter.filename}).then(() => dispatch({
                type: types.RECORD,
                payload: api.getRecordList(toAnnot === 0 ? 1 : 0),
            })).catch((err2) => {
                ErrorActions.rejectPromiseWithLocalError(err2.message);
            }),
        }).catch((err) => {
            ErrorActions.rejectPromiseWithLocalError(err.message);
        });
    };
}

/**
 * @function getRecord
 * @desc This function send a get request to
 * get the letters statut and id.
 * @returns {object} the promise
 * @version 1.0
 * @since 1.0
 * @public
 */
export function setToAnnot() {
    return (dispatch, getState, { api }) => {
        const state = getState();
        const toAnnot = !RecordSelector.getToAnnot(state);

        return dispatch({
            type: types.ADD_TO,
            payload: { toAnnot },
        });
    };
}


/**
 * @function setStep
 * @desc This function get step
 * @returns {number} the main letter step
 * @version 1.0
 * @since 1.0
 * @public
 */
export function setStep(stepValue) {
    return (dispatch, getState, { api }) => {
        return dispatch({
            type: types.STEP,
            payload: { step: stepValue },
        });
    };
}

/**
 * @function getRecord
 * @desc This function send a get request to
 * get the letters statut and id.
 * @returns {object} the promise
 * @version 1.0
 * @since 1.0
 * @public
 */
export function deleteAnnotation(data) {
    return (dispatch, _, { api }) => {

        return dispatch({
            type: types.DELETE_ANNOT,
            payload: api.deleteAnnotation(data),
        }).catch((err) => {
            ErrorActions.rejectPromiseWithLocalError(err.message);
        });
    };
}

/**
 * @function getRecord
 * @desc This function send a get request to
 * get the letters statut and id.
 * @returns {object} the promise
 * @version 1.0
 * @since 1.0
 * @public
 */
export function postAnnotation(docId, selectedTerm, nom_lettre, categorie, sousCategorie, selectedTermStart, selectedTermEnd,) {
    return (dispatch, getState, { api }) => {
        const state = getState();
        const name = MeSelector.getName(state) || Map({});
        const data = {
            docId, selectedTerm, nom_lettre,
            categorie, sousCategorie,
            selectedTermStart, selectedTermEnd,
            user: name,
        };
        return dispatch({
            type: types.PUSH_ANNOT,
            payload: api.postAnnotation(data),
        }).catch((err) => {
            ErrorActions.rejectPromiseWithLocalError(err.message);
        });
    };
}


/**
 * @function getRecord
 * @desc This function send a get request to
 * get the letters statut and id.
 * @returns {object} the promise
 * @version 1.0
 * @since 1.0
 * @public
 */
export function setCurrentLetter(letter) {
    return (dispatch, _, { api }) => {

        return dispatch({
            type: types.ADD_CURRENT_LETTER,
            payload: { letter },
        });
    };
}

/**
 * @function clearError
 * @desc This function clear error object
 * @returns {object} the promise
 * @version 1.0
 * @since 1.0
 * @public
 */
export function clearError() {
    return (dispatch) => dispatch({
        type: types.CLEAR_ERROR,
    });
}

/**
 * @function setAnnotationStep
 * @desc This function send the step
 * @returns {number} the step
 * @version 1.0
 * @since 1.0
 * @public
 */
export function setAnnotationStep(stepAnnotation) {
    return (dispatch, getState, { api }) => {
        const state = getState();
        const tpmLetter = RecordSelector.getMainLetter(state);
        const letter = tpmLetter.toJS();

        const data = {
            docId: letter.docId, filename: letter.filename, step: stepAnnotation,
        };
        return dispatch({
            type: types.STEP,
            payload: api.postAnnotationStep(data),
        }).catch((err) => {
            ErrorActions.rejectPromiseWithLocalError(err.message);
        });
    };
}

/**
 * @function setMainLetter
 * @desc This function send the step
 * @returns {object} the promise
 * @version 1.0setMainLetter
 * @since 1.0
 * @public
 */
export function setMainLetter() {
    return (dispatch, getState, { api }) => {
        const state = getState();
        const letter = RecordSelector.getCurrentLetter(state).toJS();
        const data = {
            docId: letter.docId, filename: letter.filename, statut:1,
        };
        api.updateMainLetter(data).then(({docId, filename, statut}) => {
            this.setPJListMainLetter(filename);
        }).catch((err) => {
            ErrorActions.rejectPromiseWithLocalError(err.message);
        });
    };
}

/**
 * @function setPJListMainLetter
 * @desc This function update pJList
 * @returns {object} the promise
 * @version 1.0
 * @since 1.0
 * @public
 */
export function setPJListMainLetter(oldFilename) {
    return (dispatch, getState, { api }) => {
        const state = getState();
        const letter = RecordSelector.getCurrentLetter(state).toJS();
        const data = {
            newFilename: letter.filename, oldFilename,
        };
        api.updatePJListMainLetter(data).then((res) => {
            return dispatch({
                type: types.SET_MAIN_LETTER,
                payload: {letter},
            }).then(() => {
                this.setIsMainLetter();
            }).catch((err) => {
                ErrorActions.rejectPromiseWithLocalError(err.message);
            });
        }).catch((err) => {
            ErrorActions.rejectPromiseWithLocalError(err.message);
        });
    };
}

/**
 * @function setMainLetterAnnotations
 * @desc This function send the letter Annotations JSON
 * @returns {object} the promise
 * @version 1.0
 * @since 1.0
 * @public
 */
export function setMainLetterAnnotations(value) {
    return (dispatch, getState, { api }) => {
        const state = getState();
        const tpmLetter = RecordSelector.getMainLetter(state);
        const letter = tpmLetter.toJS();
        const tmpAnnotations = RecordSelector.getMainLetterAnnotations(state);
        const name = MeSelector.getName(state) || Map({});
        let mainLetterAnnotations;
        let result;
        if (tmpAnnotations === null) {
            mainLetterAnnotations = tmpAnnotations;
            result = {...value};
        } else {
            mainLetterAnnotations = tmpAnnotations.toJS();
            result = { ...mainLetterAnnotations, ...value};
        }
        const newAnnotations = result;
        const data = {
            username: name,
            qcm: JSON.stringify(newAnnotations),
            docId: letter.docId,
            filename: letter.filename,
        };

        api.postAnnotations(data).then((res) => {
            return dispatch({
                type: types.PUSH_ANNOT_JSON,
                payload: {newAnnotations},
            });
        }).catch((err) => {
            ErrorActions.rejectPromiseWithLocalError(err.message);
        });
    };
}
