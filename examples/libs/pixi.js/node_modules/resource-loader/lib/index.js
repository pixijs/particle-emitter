'use strict';

// import Loader from './Loader';
// import Resource from './Resource';
// import * as async from './async';
// import * as b64 from './b64';

/* eslint-disable no-undef */

var Loader = require('./Loader').Loader;
var Resource = require('./Resource').Resource;
var async = require('./async');
var b64 = require('./b64');

/**
 *
 * @static
 * @memberof Loader
 * @member {Class<Resource>}
 */
Loader.Resource = Resource;

/**
 *
 * @static
 * @memberof Loader
 * @member {Class<async>}
 */
Loader.async = async;

/**
 *
 * @static
 * @memberof Loader
 * @member {Class<encodeBinary>}
 */
Loader.encodeBinary = b64;

/**
 *
 * @deprecated
 * @see Loader.encodeBinary
 *
 * @static
 * @memberof Loader
 * @member {Class<encodeBinary>}
 */
Loader.base64 = b64;

// export manually, and also as default
module.exports = Loader;

// default & named export
module.exports.Loader = Loader;
module.exports.default = Loader;
//# sourceMappingURL=index.js.map