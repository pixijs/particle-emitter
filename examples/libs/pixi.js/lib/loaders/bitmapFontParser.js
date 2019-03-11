'use strict';

exports.__esModule = true;
exports.parse = parse;

exports.default = function () {
    return function bitmapFontParser(resource, next) {
        // skip if no data or not xml data
        if (!resource.data || resource.type !== _resourceLoader.Resource.TYPE.XML) {
            next();

            return;
        }

        // skip if not bitmap font data, using some silly duck-typing
        if (resource.data.getElementsByTagName('page').length === 0 || resource.data.getElementsByTagName('info').length === 0 || resource.data.getElementsByTagName('info')[0].getAttribute('face') === null) {
            next();

            return;
        }

        var xmlUrl = !resource.isDataUrl ? path.dirname(resource.url) : '';

        if (resource.isDataUrl) {
            if (xmlUrl === '.') {
                xmlUrl = '';
            }

            if (this.baseUrl && xmlUrl) {
                // if baseurl has a trailing slash then add one to xmlUrl so the replace works below
                if (this.baseUrl.charAt(this.baseUrl.length - 1) === '/') {
                    xmlUrl += '/';
                }
            }
        }

        // remove baseUrl from xmlUrl
        xmlUrl = xmlUrl.replace(this.baseUrl, '');

        // if there is an xmlUrl now, it needs a trailing slash. Ensure that it does if the string isn't empty.
        if (xmlUrl && xmlUrl.charAt(xmlUrl.length - 1) !== '/') {
            xmlUrl += '/';
        }

        var pages = resource.data.getElementsByTagName('page');
        var textures = {};

        // Handle completed, when the number of textures
        // load is the same number as references in the fnt file
        var completed = function completed(page) {
            textures[page.metadata.pageFile] = page.texture;

            if (Object.keys(textures).length === pages.length) {
                parse(resource, textures);
                next();
            }
        };

        for (var i = 0; i < pages.length; ++i) {
            var pageFile = pages[i].getAttribute('file');
            var url = xmlUrl + pageFile;
            var exists = false;

            // incase the image is loaded outside
            // using the same loader, resource will be available
            for (var name in this.resources) {
                var bitmapResource = this.resources[name];

                if (bitmapResource.url === url) {
                    bitmapResource.metadata.pageFile = pageFile;
                    if (bitmapResource.texture) {
                        completed(bitmapResource);
                    } else {
                        bitmapResource.onAfterMiddleware.add(completed);
                    }
                    exists = true;
                    break;
                }
            }

            // texture is not loaded, we'll attempt to add
            // it to the load and add the texture to the list
            if (!exists) {
                // Standard loading options for images
                var options = {
                    crossOrigin: resource.crossOrigin,
                    loadType: _resourceLoader.Resource.LOAD_TYPE.IMAGE,
                    metadata: Object.assign({ pageFile: pageFile }, resource.metadata.imageMetadata),
                    parentResource: resource
                };

                this.add(url, options, completed);
            }
        }
    };
};

var _path = require('path');

var path = _interopRequireWildcard(_path);

var _resourceLoader = require('resource-loader');

var _extras = require('../extras');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Register a BitmapText font from loader resource.
 *
 * @function parseBitmapFontData
 * @memberof PIXI.loaders
 * @param {PIXI.loaders.Resource} resource - Loader resource.
 * @param {PIXI.Texture|PIXI.Texture[]} textures - List of textures for each page.
 */
function parse(resource, textures) {
    resource.bitmapFont = _extras.BitmapText.registerFont(resource.data, textures);
}
//# sourceMappingURL=bitmapFontParser.js.map