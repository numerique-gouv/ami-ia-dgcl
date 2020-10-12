import * as ErrorActions from '../Error/actions.js';
// Auth redux
import * as AuthSelector from './selector.js';
import types from './constants.js';

/**
 * @function postAuth
 * @desc This function send a post request to
 * identify the user.
 * @param {string} phone - user phone number
 * @param {object} device - device credentials
 * @param {object} address - user address (cf: addr DTO)
 * @returns {object} the promise
 * @version 1.0
 * @since 1.0
 * @public
 */
export function postAuth(username, password) {
    return (dispatch, _, { api }) => dispatch({
        type: types.IDENTIFICATION,
        payload: api.postAuth(username, password),
    }).catch((err) => {
        ErrorActions.rejectPromiseWithLocalError(err.message);
    });
}

/**
 * @function postAuthRefresh
 * @desc This function send a post request to
 * refresh the user token.
 * @returns {object} the promise
 * @version 1.0
 * @since 1.0
 * @public
 */
export function postAuthRefresh() {
    return (dispatch, getState, { api }) => {
        const state = getState();
        const refreshToken = AuthSelector.getToken(state);

        return dispatch({
            type: types.REFRESH,
            payload: api.postAuthRefresh(refreshToken),
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
