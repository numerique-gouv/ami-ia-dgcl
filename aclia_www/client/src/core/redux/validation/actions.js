/* eslint-disable camelcase */
import * as ErrorActions from '../Error/actions.js';
import types from './constants.js';

/**
 * @function getRecord
 * @desc This function send a get request to
 * get the letters statut and id.
 * @returns {object} the promise
 * @version 1.0
 * @since 1.0
 * @public
 */
export function getValidationList() {
    return (dispatch, _, { api }) => {

        return dispatch({
            type: types.VALIDATION,
            payload: api.getValidationList(),
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
export function getActe(noacte) {
    return (dispatch, _, { api }) => {

        return dispatch({
            type: types.ACTE,
            payload: api.getActe(noacte),
        }).catch((err) => {
            ErrorActions.rejectPromiseWithLocalError(err.message);
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
