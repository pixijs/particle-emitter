'use strict';

exports.__esModule = true;
exports.blobMiddlewareFactory = blobMiddlewareFactory;

var _Resource = require('../../Resource');

var _b = require('../../b64');

var Url = window.URL || window.webkitURL;

// a middleware for transforming XHR loaded Blobs into more useful objects
function blobMiddlewareFactory() {
    return function blobMiddleware(resource, next) {
        if (!resource.data) {
            next();

            return;
        }

        // if this was an XHR load of a blob
        if (resource.xhr && resource.xhrType === _Resource.Resource.XHR_RESPONSE_TYPE.BLOB) {
            // if there is no blob support we probably got a binary string back
            if (!window.Blob || typeof resource.data === 'string') {
                var type = resource.xhr.getResponseHeader('content-type');

                // this is an image, convert the binary string into a data url
                if (type && type.indexOf('image') === 0) {
                    resource.data = new Image();
                    resource.data.src = 'data:' + type + ';base64,' + (0, _b.encodeBinary)(resource.xhr.responseText);

                    resource.type = _Resource.Resource.TYPE.IMAGE;

                    // wait until the image loads and then callback
                    resource.data.onload = function () {
                        resource.data.onload = null;

                        next();
                    };

                    // next will be called on load
                    return;
                }
            }
            // if content type says this is an image, then we should transform the blob into an Image object
            else if (resource.data.type.indexOf('image') === 0) {
                    var src = Url.createObjectURL(resource.data);

                    resource.blob = resource.data;
                    resource.data = new Image();
                    resource.data.src = src;

                    resource.type = _Resource.Resource.TYPE.IMAGE;

                    // cleanup the no longer used blob after the image loads
                    // TODO: Is this correct? Will the image be invalid after revoking?
                    resource.data.onload = function () {
                        Url.revokeObjectURL(src);
                        resource.data.onload = null;

                        next();
                    };

                    // next will be called on load.
                    return;
                }
        }

        next();
    };
}
//# sourceMappingURL=blob.js.map