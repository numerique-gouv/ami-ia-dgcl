import { STATE_KEY as VALIDATION_STATE_KEY } from './reducer';

/**
 * @function getdocs
 * @description Get request Letter done by document
 * @returns {boolean}
 * @param {object} state
 * @version 1.0
 * @since 1.0
 * @public
 */
export const getValidationList = ({ [VALIDATION_STATE_KEY]: validation}) => validation.get('validationList');

export const getActe = ({ [VALIDATION_STATE_KEY]: validation}) => validation.get('acte');


/**
 * @function getIsPending
 * @desc Get request status
 * @returns {object} immutable object
 * @param {object} state
 * @version 1.0
 * @since 1.0
 * @public
 */
export const getIsPending = ({ [VALIDATION_STATE_KEY]: validation}) => validation.get('isPending');

/**
 * @function getError
 * @description Get request error
 * @returns {boolean}
 * @param {object} state
 * @version 1.0
 * @since 1.0
 * @public
 */
export const getError = ({ [VALIDATION_STATE_KEY]: validation}) => validation.get('error');
