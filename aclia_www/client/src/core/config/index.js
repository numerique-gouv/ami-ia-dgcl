import { isDev } from '../utils/env.js';

/**
 * @class Config
 * @desc All core configuration like api url
 * @public
 * @version 1.0
 * @since 1.0
 */

class Config {
    /** @type {string} - API url of our backend */
    static API_URL = isDev() ? 'http://localhost:3011/api' : 'https://dgcl-aclia.starclay.fr/api';
}

export default Config;
