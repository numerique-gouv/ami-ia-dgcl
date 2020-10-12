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
export function getCate() {
    return Network().get('/search/category');
}

export function getResultElastic(filter) {
    return Network().get('/search/letters', {
        filter,
    });
}

export function getLetter(source) {
    return Network().post('/record/search', {
        source,
    });
}

export function postLike(source) {
    return Network().post('/search/likes', {
        source,
    });
}
