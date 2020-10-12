// Lib
import Network from '../network.js';

/**
 * @function getDashboard
 * @desc Make a GET request to get current user
 * @param {string} accessToken - userToken
 * @returns {promise} Network promise with the response
 * @version 1.0
 * @since 1.0
 * @public
 */
export function getRecordList(statut) {
    return Network().get('/record/list', {
        statut,
    });
}

/**
 * @function getPJList
 * @desc Make a GET request to get current PJ list
 * @param {string} docId - letter docId
 * @param {string} filename - letter filename
 * @returns {promise} Network promise with the response
 * @version 1.0
 * @since 1.0
 * @public
 */
export function getPJList(docId, filename) {
    return Network().get('/record/pj', {
        docId,
        filename,
    });
}

/**
 * @function getDashboard
 * @desc Make a GET request to get current user
 * @param {string} accessToken - userToken
 * @returns {promise} Network promise with the response
 * @version 1.0
 * @since 1.0
 * @public
 */
export function getCurrentLetter(docId, filename) {
    return Network().get('/record/letter', {
        docId,
        filename,
    });
}

/**
 * @function getDashboard
 * @desc Make a GET request to get current user
 * @param {string} accessToken - userToken
 * @returns {promise} Network promise with the response
 * @version 1.0
 * @since 1.0
 * @public
 */
export function getCurrentLetterAnnotation(docId, filename) {
    return Network().get('/record/letter-annotation', {
        docId,
        filename,
    });
}

/**
 * @function getDashboard
 * @desc Make a GET request to get current user
 * @param {string} accessToken - userToken
 * @returns {promise} Network promise with the response
 * @version 1.0
 * @since 1.0
 * @public
 */
export function deleteAnnotation(data) {
    return Network().post('/record/delete-annotation', {
        ...data,
    });
}


/**
 * @function getDashboard
 * @desc Make a GET request to get current user
 * @param {string} accessToken - userToken
 * @returns {promise} Network promise with the response
 * @version 1.0
 * @since 1.0
 * @public
 */
export function postAnnotation(data) {
    return Network().post('/record/post-annotation', {
        ...data,
    });
}

/**
 * @function postAnnotationStep
 * @desc Make a POST request to set step annotation
 * @param {string} data - userToken
 * @returns {promise} Network promise with the response
 * @version 1.0
 * @since 1.0
 * @public
 */
export function postAnnotationStep(data) {
    return Network().post('/record/post-annotation-step', {
        ...data,
    });
}

/**
 * @function postAnnotations
 * @desc Make a POST request to set step annotation
 * @param {string} data - userToken
 * @returns {promise} Network promise with the response
 * @version 1.0
 * @since 1.0
 * @public
 */
export function postAnnotations(data) {
    return Network().post('/record/post-annotations', {
        ...data,
    });
}

/**
 * @function updateMainLetter
 * @desc Make a POST request to set main letter
 * @param {object} data - userToken
 * @returns {promise} Network promise with the response
 * @version 1.0
 * @since 1.0
 * @public
 */
export function updateMainLetter(data) {
    return Network().post('/record/update-main-letter', {
        ...data,
    });
}

/**
 * @function updatePJListMainLetter
 * @desc Make a POST request to set PJList main letter
 * @param {object} data - userToken
 * @returns {promise} Network promise with the response
 * @version 1.0
 * @since 1.0
 * @public
 */
export function updatePJListMainLetter(data) {
    return Network().post('/record/update-jplist-main-letter', {
        ...data,
    });
}

/**
 * @function updateStatut
 * @desc Make a POST request to set statut
 * @param {object} data - statut, docId, filename
 * @returns {promise} Network promise with the response
 * @version 1.0
 * @since 1.0
 * @public
 */
export function updateStatut(data) {
    return Network().post('/record/update-statut', {
        ...data,
    });
}
