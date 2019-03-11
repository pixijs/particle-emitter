'use strict';

exports.__esModule = true;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ = require('../');

var _utils = require('../utils');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Utility class for maintaining reference to a collection
 * of Textures on a single Spritesheet.
 *
 * To access a sprite sheet from your code pass its JSON data file to Pixi's loader:
 *
 * ```js
 * PIXI.loader.add("images/spritesheet.json").load(setup);
 *
 * function setup() {
 *   let sheet = PIXI.loader.resources["images/spritesheet.json"].spritesheet;
 *   ...
 * }
 * ```
 * With the `sheet.textures` you can create Sprite objects,`sheet.animations` can be used to create an AnimatedSprite.
 *
 * Sprite sheets can be packed using tools like {@link https://codeandweb.com/texturepacker|TexturePacker},
 * {@link https://renderhjs.net/shoebox/|Shoebox} or {@link https://github.com/krzysztof-o/spritesheet.js|Spritesheet.js}.
 * Default anchor points (see {@link PIXI.Texture#defaultAnchor}) and grouping of animation sprites are currently only
 * supported by TexturePacker.
 *
 * @class
 * @memberof PIXI
 */
var Spritesheet = function () {
    _createClass(Spritesheet, null, [{
        key: 'BATCH_SIZE',

        /**
         * The maximum number of Textures to build per process.
         *
         * @type {number}
         * @default 1000
         */
        get: function get() {
            return 1000;
        }

        /**
         * @param {PIXI.BaseTexture} baseTexture Reference to the source BaseTexture object.
         * @param {Object} data - Spritesheet image data.
         * @param {string} [resolutionFilename] - The filename to consider when determining
         *        the resolution of the spritesheet. If not provided, the imageUrl will
         *        be used on the BaseTexture.
         */

    }]);

    function Spritesheet(baseTexture, data) {
        var resolutionFilename = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

        _classCallCheck(this, Spritesheet);

        /**
         * Reference to ths source texture
         * @type {PIXI.BaseTexture}
         */
        this.baseTexture = baseTexture;

        /**
         * A map containing all textures of the sprite sheet.
         * Can be used to create a {@link PIXI.Sprite|Sprite}:
         * ```js
         * new PIXI.Sprite(sheet.textures["image.png"]);
         * ```
         * @member {Object}
         */
        this.textures = {};

        /**
         * A map containing the textures for each animation.
         * Can be used to create an {@link PIXI.extras.AnimatedSprite|AnimatedSprite}:
         * ```js
         * new PIXI.extras.AnimatedSprite(sheet.animations["anim_name"])
         * ```
         * @member {Object}
         */
        this.animations = {};

        /**
         * Reference to the original JSON data.
         * @type {Object}
         */
        this.data = data;

        /**
         * The resolution of the spritesheet.
         * @type {number}
         */
        this.resolution = this._updateResolution(resolutionFilename || this.baseTexture.imageUrl);

        /**
         * Map of spritesheet frames.
         * @type {Object}
         * @private
         */
        this._frames = this.data.frames;

        /**
         * Collection of frame names.
         * @type {string[]}
         * @private
         */
        this._frameKeys = Object.keys(this._frames);

        /**
         * Current batch index being processed.
         * @type {number}
         * @private
         */
        this._batchIndex = 0;

        /**
         * Callback when parse is completed.
         * @type {Function}
         * @private
         */
        this._callback = null;
    }

    /**
     * Generate the resolution from the filename or fallback
     * to the meta.scale field of the JSON data.
     *
     * @private
     * @param {string} resolutionFilename - The filename to use for resolving
     *        the default resolution.
     * @return {number} Resolution to use for spritesheet.
     */


    Spritesheet.prototype._updateResolution = function _updateResolution(resolutionFilename) {
        var scale = this.data.meta.scale;

        // Use a defaultValue of `null` to check if a url-based resolution is set
        var resolution = (0, _utils.getResolutionOfUrl)(resolutionFilename, null);

        // No resolution found via URL
        if (resolution === null) {
            // Use the scale value or default to 1
            resolution = scale !== undefined ? parseFloat(scale) : 1;
        }

        // For non-1 resolutions, update baseTexture
        if (resolution !== 1) {
            this.baseTexture.resolution = resolution;
            this.baseTexture.update();
        }

        return resolution;
    };

    /**
     * Parser spritesheet from loaded data. This is done asynchronously
     * to prevent creating too many Texture within a single process.
     *
     * @param {Function} callback - Callback when complete returns
     *        a map of the Textures for this spritesheet.
     */


    Spritesheet.prototype.parse = function parse(callback) {
        this._batchIndex = 0;
        this._callback = callback;

        if (this._frameKeys.length <= Spritesheet.BATCH_SIZE) {
            this._processFrames(0);
            this._processAnimations();
            this._parseComplete();
        } else {
            this._nextBatch();
        }
    };

    /**
     * Process a batch of frames
     *
     * @private
     * @param {number} initialFrameIndex - The index of frame to start.
     */


    Spritesheet.prototype._processFrames = function _processFrames(initialFrameIndex) {
        var frameIndex = initialFrameIndex;
        var maxFrames = Spritesheet.BATCH_SIZE;
        var sourceScale = this.baseTexture.sourceScale;

        while (frameIndex - initialFrameIndex < maxFrames && frameIndex < this._frameKeys.length) {
            var i = this._frameKeys[frameIndex];
            var data = this._frames[i];
            var rect = data.frame;

            if (rect) {
                var frame = null;
                var trim = null;
                var sourceSize = data.trimmed !== false && data.sourceSize ? data.sourceSize : data.frame;

                var orig = new _.Rectangle(0, 0, Math.floor(sourceSize.w * sourceScale) / this.resolution, Math.floor(sourceSize.h * sourceScale) / this.resolution);

                if (data.rotated) {
                    frame = new _.Rectangle(Math.floor(rect.x * sourceScale) / this.resolution, Math.floor(rect.y * sourceScale) / this.resolution, Math.floor(rect.h * sourceScale) / this.resolution, Math.floor(rect.w * sourceScale) / this.resolution);
                } else {
                    frame = new _.Rectangle(Math.floor(rect.x * sourceScale) / this.resolution, Math.floor(rect.y * sourceScale) / this.resolution, Math.floor(rect.w * sourceScale) / this.resolution, Math.floor(rect.h * sourceScale) / this.resolution);
                }

                //  Check to see if the sprite is trimmed
                if (data.trimmed !== false && data.spriteSourceSize) {
                    trim = new _.Rectangle(Math.floor(data.spriteSourceSize.x * sourceScale) / this.resolution, Math.floor(data.spriteSourceSize.y * sourceScale) / this.resolution, Math.floor(rect.w * sourceScale) / this.resolution, Math.floor(rect.h * sourceScale) / this.resolution);
                }

                this.textures[i] = new _.Texture(this.baseTexture, frame, orig, trim, data.rotated ? 2 : 0, data.anchor);

                // lets also add the frame to pixi's global cache for fromFrame and fromImage functions
                _.Texture.addToCache(this.textures[i], i);
            }

            frameIndex++;
        }
    };

    /**
     * Parse animations config
     *
     * @private
     */


    Spritesheet.prototype._processAnimations = function _processAnimations() {
        var animations = this.data.animations || {};

        for (var animName in animations) {
            this.animations[animName] = [];
            for (var _iterator = animations[animName], _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
                var _ref;

                if (_isArray) {
                    if (_i >= _iterator.length) break;
                    _ref = _iterator[_i++];
                } else {
                    _i = _iterator.next();
                    if (_i.done) break;
                    _ref = _i.value;
                }

                var frameName = _ref;

                this.animations[animName].push(this.textures[frameName]);
            }
        }
    };

    /**
     * The parse has completed.
     *
     * @private
     */


    Spritesheet.prototype._parseComplete = function _parseComplete() {
        var callback = this._callback;

        this._callback = null;
        this._batchIndex = 0;
        callback.call(this, this.textures);
    };

    /**
     * Begin the next batch of textures.
     *
     * @private
     */


    Spritesheet.prototype._nextBatch = function _nextBatch() {
        var _this = this;

        this._processFrames(this._batchIndex * Spritesheet.BATCH_SIZE);
        this._batchIndex++;
        setTimeout(function () {
            if (_this._batchIndex * Spritesheet.BATCH_SIZE < _this._frameKeys.length) {
                _this._nextBatch();
            } else {
                _this._processAnimations();
                _this._parseComplete();
            }
        }, 0);
    };

    /**
     * Destroy Spritesheet and don't use after this.
     *
     * @param {boolean} [destroyBase=false] Whether to destroy the base texture as well
     */


    Spritesheet.prototype.destroy = function destroy() {
        var destroyBase = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

        for (var i in this.textures) {
            this.textures[i].destroy();
        }
        this._frames = null;
        this._frameKeys = null;
        this.data = null;
        this.textures = null;
        if (destroyBase) {
            this.baseTexture.destroy();
        }
        this.baseTexture = null;
    };

    return Spritesheet;
}();

exports.default = Spritesheet;
//# sourceMappingURL=Spritesheet.js.map