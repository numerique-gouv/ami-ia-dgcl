import types from './constants.js';
import initialState from './state.js';

/**
 * @constant key normalize key
 * @desc key for normalizr and immutable
 * @version 1.0
 * @since 1.0
 * @public
 */
export const STATE_KEY = 'validation';

/**
 * @function dataReducer redux reducer
 * @desc return new state according to the triggered action
 * @param {object} state redux state
 * @param {object} action action trigger
 * @return {object} state
 * @version 1.0
 * @since 1.0
 * @public
 */
export default function dataReducer(state = initialState, action) {
    switch (action.type) {
    case types.VALIDATION_PENDING:
    case types.ACTE_PENDING:
        return state.merge({
            error: null,
            isPending: true,
        });

    case types.VALIDATION_FULFILLED:
        return state.merge({
            isPending: false,
            error: null,
            validationList: action.payload.list ? action.payload.list : null,
            acte: null,
        });

    case types.VALIDATION_REJECTED:
    case types.ACTE_REJECTED:
        return state.merge({
            isPending: false,
            error: action.payload,
            validationList: null,
            acte: null,
        });

    case types.ACTE_FULFILLED:
        return state.merge({
            isPending: false,
            error: null,
            acte: action.payload.acte ? action.payload.acte : null,
            validationList: null,
        });

    default:
        return state;
    }
}

