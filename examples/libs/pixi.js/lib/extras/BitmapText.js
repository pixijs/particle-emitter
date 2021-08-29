'use strict';

exports.__esModule = true;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _core = require('../core');

var core = _interopRequireWildcard(_core);

var _ObservablePoint = require('../core/math/ObservablePoint');

var _ObservablePoint2 = _interopRequireDefault(_ObservablePoint);

var _utils = require('../core/utils');

var _settings = require('../core/settings');

var _settings2 = _interopRequireDefault(_settings);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * A BitmapText object will create a line or multiple lines of text using bitmap font. To
 * split a line you can use '\n', '\r' or '\r\n' in your string. You can generate the fnt files using:
 *
 * A BitmapText can only be created when the font is loaded
 *
 * ```js
 * // in this case the font is in a file called 'desyrel.fnt'
 * let bitmapText = new PIXI.extras.BitmapText("text using a fancy font!", {font: "35px Desyrel", align: "right"});
 * ```
 *
 * http://www.angelcode.com/products/bmfont/ for windows or
 * http://www.bmglyph.com/ for mac.
 *
 * @class
 * @extends PIXI.Container
 * @memberof PIXI.extras
 */
var BitmapText = function (_core$Container) {
    _inherits(BitmapText, _core$Container);

    /**
     * @param {string} text - The copy that you would like the text to display
     * @param {object} style - The style parameters
     * @param {string|object} style.font - The font descriptor for the object, can be passed as a string of form
     *      "24px FontName" or "FontName" or as an object with explicit name/size properties.
     * @param {string} [style.font.name] - The bitmap font id
     * @param {number} [style.font.size] - The size of the font in pixels, e.g. 24
     * @param {string} [style.align='left'] - Alignment for multiline text ('left', 'center' or 'right'), does not affect
     *      single line text
     * @param {number} [style.tint=0xFFFFFF] - The tint color
     */
    function BitmapText(text) {
        var style = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        _classCallCheck(this, BitmapText);

        /**
         * Private tracker for the width of the overall text
         *
         * @member {number}
         * @private
         */
        var _this = _possibleConstructorReturn(this, _core$Container.call(this));

        _this._textWidth = 0;

        /**
         * Private tracker for the height of the overall text
         *
         * @member {number}
         * @private
         */
        _this._textHeight = 0;

        /**
         * Private tracker for the letter sprite pool.
         *
         * @member {PIXI.Sprite[]}
         * @private
         */
        _this._glyphs = [];

        /**
         * Private tracker for the current style.
         *
         * @member {object}
         * @private
         */
        _this._font = {
            tint: style.tint !== undefined ? style.tint : 0xFFFFFF,
            align: style.align || 'left',
            name: null,
            size: 0
        };

        /**
         * Private tracker for the current font.
         *
         * @member {object}
         * @private
         */
        _this.font = style.font; // run font setter

        /**
         * Private tracker for the current text.
         *
         * @member {string}
         * @private
         */
        _this._text = text;

        /**
         * The max width of this bitmap text in pixels. If the text provided is longer than the
         * value provided, line breaks will be automatically inserted in the last whitespace.
         * Disable by setting value to 0
         *
         * @member {number}
         * @private
         */
        _this._maxWidth = 0;

        /**
         * The max line height. This is useful when trying to use the total height of the Text,
         * ie: when trying to vertically align.
         *
         * @member {number}
         * @private
         */
        _this._maxLineHeight = 0;

        /**
         * Letter spacing. This is useful for setting the space between characters.
         * @member {number}
         * @private
         */
        _this._letterSpacing = 0;

        /**
         * Text anchor. read-only
         *
         * @member {PIXI.ObservablePoint}
         * @private
         */
        _this._anchor = new _ObservablePoint2.default(function () {
            _this.dirty = true;
        }, _this, 0, 0);

        /**
         * The dirty state of this object.
         *
         * @member {boolean}
         */
        _this.dirty = false;

        _this.updateText();
        return _this;
    }

    /**
     * Renders text and updates it when needed
     *
     * @private
     */


    BitmapText.prototype.updateText = function updateText() {
        var data = BitmapText.fonts[this._font.name];
        var scale = this._font.size / data.size;
        var pos = new core.Point();
        var chars = [];
        var lineWidths = [];
        var text = this.text.replace(/(?:\r\n|\r)/g, '\n');
        var textLength = text.length;
        var maxWidth = this._maxWidth * data.size / this._font.size;

        var prevCharCode = null;
        var lastLineWidth = 0;
        var maxLineWidth = 0;
        var line = 0;
        var lastBreakPos = -1;
        var lastBreakWidth = 0;
        var spacesRemoved = 0;
        var maxLineHeight = 0;

        for (var i = 0; i < textLength; i++) {
            var charCode = text.charCodeAt(i);
            var char = text.charAt(i);

            if (/(?:\s)/.test(char)) {
                lastBreakPos = i;
                lastBreakWidth = lastLineWidth;
            }

            if (char === '\r' || char === '\n') {
                lineWidths.push(lastLineWidth);
                maxLineWidth = Math.max(maxLineWidth, lastLineWidth);
                ++line;
                ++spacesRemoved;

                pos.x = 0;
                pos.y += data.lineHeight;
                prevCharCode = null;
                continue;
            }

            var charData = data.chars[charCode];

            if (!charData) {
                continue;
            }

            if (prevCharCode && charData.kerning[prevCharCode]) {
                pos.x += charData.kerning[prevCharCode];
            }

            chars.push({
                texture: charData.texture,
                line: line,
                charCode: charCode,
                position: new core.Point(pos.x + charData.xOffset + this._letterSpacing / 2, pos.y + charData.yOffset)
            });
            pos.x += charData.xAdvance + this._letterSpacing;
            lastLineWidth = pos.x;
            maxLineHeight = Math.max(maxLineHeight, charData.yOffset + charData.texture.height);
            prevCharCode = charCode;

            if (lastBreakPos !== -1 && maxWidth > 0 && pos.x > maxWidth) {
                ++spacesRemoved;
                core.utils.removeItems(chars, 1 + lastBreakPos - spacesRemoved, 1 + i - lastBreakPos);
                i = lastBreakPos;
                lastBreakPos = -1;

                lineWidths.push(lastBreakWidth);
                maxLineWidth = Math.max(maxLineWidth, lastBreakWidth);
                line++;

                pos.x = 0;
                pos.y += data.lineHeight;
                prevCharCode = null;
            }
        }

        var lastChar = text.charAt(text.length - 1);

        if (lastChar !== '\r' && lastChar !== '\n') {
            if (/(?:\s)/.test(lastChar)) {
                lastLineWidth = lastBreakWidth;
            }

            lineWidths.push(lastLineWidth);
            maxLineWidth = Math.max(maxLineWidth, lastLineWidth);
        }

        var lineAlignOffsets = [];

        for (var _i = 0; _i <= line; _i++) {
            var alignOffset = 0;

            if (this._font.align === 'right') {
                alignOffset = maxLineWidth - lineWidths[_i];
            } else if (this._font.align === 'center') {
                alignOffset = (maxLineWidth - lineWidths[_i]) / 2;
            }

            lineAlignOffsets.push(alignOffset);
        }

        var lenChars = chars.length;
        var tint = this.tint;

        for (var _i2 = 0; _i2 < lenChars; _i2++) {
            var c = this._glyphs[_i2]; // get the next glyph sprite

            if (c) {
                c.texture = chars[_i2].texture;
            } else {
                c = new core.Sprite(chars[_i2].texture);
                this._glyphs.push(c);
            }

            c.position.x = (chars[_i2].position.x + lineAlignOffsets[chars[_i2].line]) * scale;
            c.position.y = chars[_i2].position.y * scale;
            c.scale.x = c.scale.y = scale;
            c.tint = tint;

            if (!c.parent) {
                this.addChild(c);
            }
        }

        // remove unnecessary children.
        for (var _i3 = lenChars; _i3 < this._glyphs.length; ++_i3) {
            this.removeChild(this._glyphs[_i3]);
        }

        this._textWidth = maxLineWidth * scale;
        this._textHeight = (pos.y + data.lineHeight) * scale;

        // apply anchor
        if (this.anchor.x !== 0 || this.anchor.y !== 0) {
            for (var _i4 = 0; _i4 < lenChars; _i4++) {
                this._glyphs[_i4].x -= this._textWidth * this.anchor.x;
                this._glyphs[_i4].y -= this._textHeight * this.anchor.y;
            }
        }
        this._maxLineHeight = maxLineHeight * scale;
    };

    /**
     * Updates the transform of this object
     *
     * @private
     */


    BitmapText.prototype.updateTransform = function updateTransform() {
        this.validate();
        this.containerUpdateTransform();
    };

    /**
     * Validates text before calling parent's getLocalBounds
     *
     * @return {PIXI.Rectangle} The rectangular bounding area
     */


    BitmapText.prototype.getLocalBounds = function getLocalBounds() {
        this.validate();

        return _core$Container.prototype.getLocalBounds.call(this);
    };

    /**
     * Updates text when needed
     *
     * @private
     */


    BitmapText.prototype.validate = function validate() {
        if (this.dirty) {
            this.updateText();
            this.dirty = false;
        }
    };

    /**
     * The tint of the BitmapText object
     *
     * @member {number}
     */


    /**
     * Register a bitmap font with data and a texture.
     *
     * @static
     * @param {XMLDocument} xml - The XML document data.
     * @param {Object.<string, PIXI.Texture>|PIXI.Texture|PIXI.Texture[]} textures - List of textures for each page.
     *  If providing an object, the key is the `<page>` element's `file` attribute in the FNT file.
     * @return {Object} Result font object with font, size, lineHeight and char fields.
     */
    BitmapText.registerFont = function registerFont(xml, textures) {
        var data = {};
        var info = xml.getElementsByTagName('info')[0];
        var common = xml.getElementsByTagName('common')[0];
        var pages = xml.getElementsByTagName('page');
        var res = (0, _utils.getResolutionOfUrl)(pages[0].getAttribute('file'), _settings2.default.RESOLUTION);
        var pagesTextures = {};

        data.font = info.getAttribute('face');
        data.size = parseInt(info.getAttribute('size'), 10);
        data.lineHeight = parseInt(common.getAttribute('lineHeight'), 10) / res;
        data.chars = {};

        // Single texture, convert to list
        if (textures instanceof core.Texture) {
            textures = [textures];
        }

        // Convert the input Texture, Textures or object
        // into a page Texture lookup by "id"
        for (var i = 0; i < pages.length; i++) {
            var id = pages[i].getAttribute('id');
            var file = pages[i].getAttribute('file');

            pagesTextures[id] = textures instanceof Array ? textures[i] : textures[file];
        }

        // parse letters
        var letters = xml.getElementsByTagName('char');

        for (var _i5 = 0; _i5 < letters.length; _i5++) {
            var letter = letters[_i5];
            var charCode = parseInt(letter.getAttribute('id'), 10);
            var page = letter.getAttribute('page') || 0;
            var textureRect = new core.Rectangle(parseInt(letter.getAttribute('x'), 10) / res + pagesTextures[page].frame.x / res, parseInt(letter.getAttribute('y'), 10) / res + pagesTextures[page].frame.y / res, parseInt(letter.getAttribute('width'), 10) / res, parseInt(letter.getAttribute('height'), 10) / res);

            data.chars[charCode] = {
                xOffset: parseInt(letter.getAttribute('xoffset'), 10) / res,
                yOffset: parseInt(letter.getAttribute('yoffset'), 10) / res,
                xAdvance: parseInt(letter.getAttribute('xadvance'), 10) / res,
                kerning: {},
                texture: new core.Texture(pagesTextures[page].baseTexture, textureRect),
                page: page
            };
        }

        // parse kernings
        var kernings = xml.getElementsByTagName('kerning');

        for (var _i6 = 0; _i6 < kernings.length; _i6++) {
            var kerning = kernings[_i6];
            var first = parseInt(kerning.getAttribute('first'), 10) / res;
            var second = parseInt(kerning.getAttribute('second'), 10) / res;
            var amount = parseInt(kerning.getAttribute('amount'), 10) / res;

            if (data.chars[second]) {
                data.chars[second].kerning[first] = amount;
            }
        }

        // I'm leaving this as a temporary fix so we can test the bitmap fonts in v3
        // but it's very likely to change
        BitmapText.fonts[data.font] = data;

        return data;
    };

    _createClass(BitmapText, [{
        key: 'tint',
        get: function get() {
            return this._font.tint;
        },
        set: function set(value) // eslint-disable-line require-jsdoc
        {
            this._font.tint = typeof value === 'number' && value >= 0 ? value : 0xFFFFFF;

            this.dirty = true;
        }

        /**
         * The alignment of the BitmapText object
         *
         * @member {string}
         * @default 'left'
         */

    }, {
        key: 'align',
        get: function get() {
            return this._font.align;
        },
        set: function set(value) // eslint-disable-line require-jsdoc
        {
            this._font.align = value || 'left';

            this.dirty = true;
        }

        /**
         * The anchor sets the origin point of the text.
         * The default is 0,0 this means the text's origin is the top left
         * Setting the anchor to 0.5,0.5 means the text's origin is centered
         * Setting the anchor to 1,1 would mean the text's origin point will be the bottom right corner
         *
         * @member {PIXI.Point | number}
         */

    }, {
        key: 'anchor',
        get: function get() {
            return this._anchor;
        },
        set: function set(value) // eslint-disable-line require-jsdoc
        {
            if (typeof value === 'number') {
                this._anchor.set(value);
            } else {
                this._anchor.copy(value);
            }
        }

        /**
         * The font descriptor of the BitmapText object
         *
         * @member {string|object}
         */

    }, {
        key: 'font',
        get: function get() {
            return this._font;
        },
        set: function set(value) // eslint-disable-line require-jsdoc
        {
            if (!value) {
                return;
            }

            if (typeof value === 'string') {
                value = value.split(' ');

                this._font.name = value.length === 1 ? value[0] : value.slice(1).join(' ');
                this._font.size = value.length >= 2 ? parseInt(value[0], 10) : BitmapText.fonts[this._font.name].size;
            } else {
                this._font.name = value.name;
                this._font.size = typeof value.size === 'number' ? value.size : parseInt(value.size, 10);
            }

            this.dirty = true;
        }

        /**
         * The text of the BitmapText object
         *
         * @member {string}
         */

    }, {
        key: 'text',
        get: function get() {
            return this._text;
        },
        set: function set(value) // eslint-disable-line require-jsdoc
        {
            value = value.toString() || ' ';
            if (this._text === value) {
                return;
            }
            this._text = value;
            this.dirty = true;
        }

        /**
         * The max width of this bitmap text in pixels. If the text provided is longer than the
         * value provided, line breaks will be automatically inserted in the last whitespace.
         * Disable by setting value to 0
         *
         * @member {number}
         */

    }, {
        key: 'maxWidth',
        get: function get() {
            return this._maxWidth;
        },
        set: function set(value) // eslint-disable-line require-jsdoc
        {
            if (this._maxWidth === value) {
                return;
            }
            this._maxWidth = value;
            this.dirty = true;
        }

        /**
         * The max line height. This is useful when trying to use the total height of the Text,
         * ie: when trying to vertically align.
         *
         * @member {number}
         * @readonly
         */

    }, {
        key: 'maxLineHeight',
        get: function get() {
            this.validate();

            return this._maxLineHeight;
        }

        /**
         * The width of the overall text, different from fontSize,
         * which is defined in the style object
         *
         * @member {number}
         * @readonly
         */

    }, {
        key: 'textWidth',
        get: function get() {
            this.validate();

            return this._textWidth;
        }

        /**
         * Additional space between characters.
         *
         * @member {number}
         */

    }, {
        key: 'letterSpacing',
        get: function get() {
            return this._letterSpacing;
        },
        set: function set(value) // eslint-disable-line require-jsdoc
        {
            if (this._letterSpacing !== value) {
                this._letterSpacing = value;
                this.dirty = true;
            }
        }

        /**
         * The height of the overall text, different from fontSize,
         * which is defined in the style object
         *
         * @member {number}
         * @readonly
         */

    }, {
        key: 'textHeight',
        get: function get() {
            this.validate();

            return this._textHeight;
        }
    }]);

    return BitmapText;
}(core.Container);

exports.default = BitmapText;


BitmapText.fonts = {};
//# sourceMappingURL=BitmapText.js.map