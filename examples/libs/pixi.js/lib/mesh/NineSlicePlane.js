'use strict';

exports.__esModule = true;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Plane2 = require('./Plane');

var _Plane3 = _interopRequireDefault(_Plane2);

var _CanvasTinter = require('../core/sprites/canvas/CanvasTinter');

var _CanvasTinter2 = _interopRequireDefault(_CanvasTinter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DEFAULT_BORDER_SIZE = 10;

/**
 * The NineSlicePlane allows you to stretch a texture using 9-slice scaling. The corners will remain unscaled (useful
 * for buttons with rounded corners for example) and the other areas will be scaled horizontally and or vertically
 *
 *```js
 * let Plane9 = new PIXI.NineSlicePlane(PIXI.Texture.fromImage('BoxWithRoundedCorners.png'), 15, 15, 15, 15);
 *  ```
 * <pre>
 *      A                          B
 *    +---+----------------------+---+
 *  C | 1 |          2           | 3 |
 *    +---+----------------------+---+
 *    |   |                      |   |
 *    | 4 |          5           | 6 |
 *    |   |                      |   |
 *    +---+----------------------+---+
 *  D | 7 |          8           | 9 |
 *    +---+----------------------+---+

 *  When changing this objects width and/or height:
 *     areas 1 3 7 and 9 will remain unscaled.
 *     areas 2 and 8 will be stretched horizontally
 *     areas 4 and 6 will be stretched vertically
 *     area 5 will be stretched both horizontally and vertically
 * </pre>
 *
 * @class
 * @extends PIXI.mesh.Plane
 * @memberof PIXI.mesh
 *
 */

var NineSlicePlane = function (_Plane) {
    _inherits(NineSlicePlane, _Plane);

    /**
     * @param {PIXI.Texture} texture - The texture to use on the NineSlicePlane.
     * @param {int} [leftWidth=10] size of the left vertical bar (A)
     * @param {int} [topHeight=10] size of the top horizontal bar (C)
     * @param {int} [rightWidth=10] size of the right vertical bar (B)
     * @param {int} [bottomHeight=10] size of the bottom horizontal bar (D)
     */
    function NineSlicePlane(texture, leftWidth, topHeight, rightWidth, bottomHeight) {
        _classCallCheck(this, NineSlicePlane);

        var _this = _possibleConstructorReturn(this, _Plane.call(this, texture, 4, 4));

        _this._origWidth = texture.orig.width;
        _this._origHeight = texture.orig.height;

        /**
         * The width of the NineSlicePlane, setting this will actually modify the vertices and UV's of this plane
         *
         * @member {number}
         * @memberof PIXI.NineSlicePlane#
         * @override
         */
        _this._width = _this._origWidth;

        /**
         * The height of the NineSlicePlane, setting this will actually modify the vertices and UV's of this plane
         *
         * @member {number}
         * @memberof PIXI.NineSlicePlane#
         * @override
         */
        _this._height = _this._origHeight;

        /**
         * The width of the left column (a)
         *
         * @member {number}
         * @memberof PIXI.NineSlicePlane#
         * @override
         */
        _this._leftWidth = typeof leftWidth !== 'undefined' ? leftWidth : DEFAULT_BORDER_SIZE;

        /**
         * The width of the right column (b)
         *
         * @member {number}
         * @memberof PIXI.NineSlicePlane#
         * @override
         */
        _this._rightWidth = typeof rightWidth !== 'undefined' ? rightWidth : DEFAULT_BORDER_SIZE;

        /**
         * The height of the top row (c)
         *
         * @member {number}
         * @memberof PIXI.NineSlicePlane#
         * @override
         */
        _this._topHeight = typeof topHeight !== 'undefined' ? topHeight : DEFAULT_BORDER_SIZE;

        /**
         * The height of the bottom row (d)
         *
         * @member {number}
         * @memberof PIXI.NineSlicePlane#
         * @override
         */
        _this._bottomHeight = typeof bottomHeight !== 'undefined' ? bottomHeight : DEFAULT_BORDER_SIZE;

        /**
         * Cached tint value so we can tell when the tint is changed.
         *
         * @member {number}
         * @protected
         */
        _this._cachedTint = 0xFFFFFF;

        /**
         * Cached tinted texture.
         *
         * @member {HTMLCanvasElement}
         * @protected
         */
        _this._tintedTexture = null;

        /**
         * Temporary storage for canvas source coords
         *
         * @member {number[]}
         * @private
         */
        _this._canvasUvs = null;

        _this.refresh(true);
        return _this;
    }

    /**
     * Updates the horizontal vertices.
     *
     */


    NineSlicePlane.prototype.updateHorizontalVertices = function updateHorizontalVertices() {
        var vertices = this.vertices;

        var h = this._topHeight + this._bottomHeight;
        var scale = this._height > h ? 1.0 : this._height / h;

        vertices[9] = vertices[11] = vertices[13] = vertices[15] = this._topHeight * scale;
        vertices[17] = vertices[19] = vertices[21] = vertices[23] = this._height - this._bottomHeight * scale;
        vertices[25] = vertices[27] = vertices[29] = vertices[31] = this._height;
    };

    /**
     * Updates the vertical vertices.
     *
     */


    NineSlicePlane.prototype.updateVerticalVertices = function updateVerticalVertices() {
        var vertices = this.vertices;

        var w = this._leftWidth + this._rightWidth;
        var scale = this._width > w ? 1.0 : this._width / w;

        vertices[2] = vertices[10] = vertices[18] = vertices[26] = this._leftWidth * scale;
        vertices[4] = vertices[12] = vertices[20] = vertices[28] = this._width - this._rightWidth * scale;
        vertices[6] = vertices[14] = vertices[22] = vertices[30] = this._width;
    };

    /**
     * Renders the object using the Canvas renderer
     *
     * @private
     * @param {PIXI.CanvasRenderer} renderer - The canvas renderer to render with.
     */


    NineSlicePlane.prototype._renderCanvas = function _renderCanvas(renderer) {
        var context = renderer.context;
        var transform = this.worldTransform;
        var res = renderer.resolution;
        var isTinted = this.tint !== 0xFFFFFF;
        var texture = this._texture;

        // Work out tinting
        if (isTinted) {
            if (this._cachedTint !== this.tint) {
                // Tint has changed, need to update the tinted texture and use that instead

                this._cachedTint = this.tint;

                this._tintedTexture = _CanvasTinter2.default.getTintedTexture(this, this.tint);
            }
        }

        var textureSource = !isTinted ? texture.baseTexture.source : this._tintedTexture;

        if (!this._canvasUvs) {
            this._canvasUvs = [0, 0, 0, 0, 0, 0, 0, 0];
        }

        var vertices = this.vertices;
        var uvs = this._canvasUvs;
        var u0 = isTinted ? 0 : texture.frame.x;
        var v0 = isTinted ? 0 : texture.frame.y;
        var u1 = u0 + texture.frame.width;
        var v1 = v0 + texture.frame.height;

        uvs[0] = u0;
        uvs[1] = u0 + this._leftWidth;
        uvs[2] = u1 - this._rightWidth;
        uvs[3] = u1;
        uvs[4] = v0;
        uvs[5] = v0 + this._topHeight;
        uvs[6] = v1 - this._bottomHeight;
        uvs[7] = v1;

        for (var i = 0; i < 8; i++) {
            uvs[i] *= texture.baseTexture.resolution;
        }

        context.globalAlpha = this.worldAlpha;
        renderer.setBlendMode(this.blendMode);

        if (renderer.roundPixels) {
            context.setTransform(transform.a * res, transform.b * res, transform.c * res, transform.d * res, transform.tx * res | 0, transform.ty * res | 0);
        } else {
            context.setTransform(transform.a * res, transform.b * res, transform.c * res, transform.d * res, transform.tx * res, transform.ty * res);
        }

        for (var row = 0; row < 3; row++) {
            for (var col = 0; col < 3; col++) {
                var ind = col * 2 + row * 8;
                var sw = Math.max(1, uvs[col + 1] - uvs[col]);
                var sh = Math.max(1, uvs[row + 5] - uvs[row + 4]);
                var dw = Math.max(1, vertices[ind + 10] - vertices[ind]);
                var dh = Math.max(1, vertices[ind + 11] - vertices[ind + 1]);

                context.drawImage(textureSource, uvs[col], uvs[row + 4], sw, sh, vertices[ind], vertices[ind + 1], dw, dh);
            }
        }
    };

    /**
     * The width of the NineSlicePlane, setting this will actually modify the vertices and UV's of this plane
     *
     * @member {number}
     */


    /**
     * Refreshes NineSlicePlane coords. All of them.
     */
    NineSlicePlane.prototype._refresh = function _refresh() {
        _Plane.prototype._refresh.call(this);

        var uvs = this.uvs;
        var texture = this._texture;

        this._origWidth = texture.orig.width;
        this._origHeight = texture.orig.height;

        var _uvw = 1.0 / this._origWidth;
        var _uvh = 1.0 / this._origHeight;

        uvs[0] = uvs[8] = uvs[16] = uvs[24] = 0;
        uvs[1] = uvs[3] = uvs[5] = uvs[7] = 0;
        uvs[6] = uvs[14] = uvs[22] = uvs[30] = 1;
        uvs[25] = uvs[27] = uvs[29] = uvs[31] = 1;

        uvs[2] = uvs[10] = uvs[18] = uvs[26] = _uvw * this._leftWidth;
        uvs[4] = uvs[12] = uvs[20] = uvs[28] = 1 - _uvw * this._rightWidth;
        uvs[9] = uvs[11] = uvs[13] = uvs[15] = _uvh * this._topHeight;
        uvs[17] = uvs[19] = uvs[21] = uvs[23] = 1 - _uvh * this._bottomHeight;

        this.updateHorizontalVertices();
        this.updateVerticalVertices();

        this.dirty++;

        this.multiplyUvs();
    };

    _createClass(NineSlicePlane, [{
        key: 'width',
        get: function get() {
            return this._width;
        },
        set: function set(value) // eslint-disable-line require-jsdoc
        {
            this._width = value;
            this._refresh();
        }

        /**
         * The height of the NineSlicePlane, setting this will actually modify the vertices and UV's of this plane
         *
         * @member {number}
         */

    }, {
        key: 'height',
        get: function get() {
            return this._height;
        },
        set: function set(value) // eslint-disable-line require-jsdoc
        {
            this._height = value;
            this._refresh();
        }

        /**
         * The width of the left column
         *
         * @member {number}
         */

    }, {
        key: 'leftWidth',
        get: function get() {
            return this._leftWidth;
        },
        set: function set(value) // eslint-disable-line require-jsdoc
        {
            this._leftWidth = value;
            this._refresh();
        }

        /**
         * The width of the right column
         *
         * @member {number}
         */

    }, {
        key: 'rightWidth',
        get: function get() {
            return this._rightWidth;
        },
        set: function set(value) // eslint-disable-line require-jsdoc
        {
            this._rightWidth = value;
            this._refresh();
        }

        /**
         * The height of the top row
         *
         * @member {number}
         */

    }, {
        key: 'topHeight',
        get: function get() {
            return this._topHeight;
        },
        set: function set(value) // eslint-disable-line require-jsdoc
        {
            this._topHeight = value;
            this._refresh();
        }

        /**
         * The height of the bottom row
         *
         * @member {number}
         */

    }, {
        key: 'bottomHeight',
        get: function get() {
            return this._bottomHeight;
        },
        set: function set(value) // eslint-disable-line require-jsdoc
        {
            this._bottomHeight = value;
            this._refresh();
        }
    }]);

    return NineSlicePlane;
}(_Plane3.default);

exports.default = NineSlicePlane;
//# sourceMappingURL=NineSlicePlane.js.map