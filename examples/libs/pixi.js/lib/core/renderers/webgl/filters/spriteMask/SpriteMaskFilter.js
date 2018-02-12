'use strict';

exports.__esModule = true;

var _Filter2 = require('../Filter');

var _Filter3 = _interopRequireDefault(_Filter2);

var _math = require('../../../../math');

var _path = require('path');

var _TextureMatrix = require('../../../../textures/TextureMatrix');

var _TextureMatrix2 = _interopRequireDefault(_TextureMatrix);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * The SpriteMaskFilter class
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI
 */
var SpriteMaskFilter = function (_Filter) {
    _inherits(SpriteMaskFilter, _Filter);

    /**
     * @param {PIXI.Sprite} sprite - the target sprite
     */
    function SpriteMaskFilter(sprite) {
        _classCallCheck(this, SpriteMaskFilter);

        var maskMatrix = new _math.Matrix();

        var _this = _possibleConstructorReturn(this, _Filter.call(this, 'attribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\n\nuniform mat3 projectionMatrix;\nuniform mat3 otherMatrix;\n\nvarying vec2 vMaskCoord;\nvarying vec2 vTextureCoord;\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n\n    vTextureCoord = aTextureCoord;\n    vMaskCoord = ( otherMatrix * vec3( aTextureCoord, 1.0)  ).xy;\n}\n', 'varying vec2 vMaskCoord;\nvarying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform sampler2D mask;\nuniform float alpha;\nuniform vec4 maskClamp;\n\nvoid main(void)\n{\n    float clip = step(3.5,\n        step(maskClamp.x, vMaskCoord.x) +\n        step(maskClamp.y, vMaskCoord.y) +\n        step(vMaskCoord.x, maskClamp.z) +\n        step(vMaskCoord.y, maskClamp.w));\n\n    vec4 original = texture2D(uSampler, vTextureCoord);\n    vec4 masky = texture2D(mask, vMaskCoord);\n\n    original *= (masky.r * masky.a * alpha * clip);\n\n    gl_FragColor = original;\n}\n'));

        sprite.renderable = false;

        _this.maskSprite = sprite;
        _this.maskMatrix = maskMatrix;
        return _this;
    }

    /**
     * Applies the filter
     *
     * @param {PIXI.FilterManager} filterManager - The renderer to retrieve the filter from
     * @param {PIXI.RenderTarget} input - The input render target.
     * @param {PIXI.RenderTarget} output - The target to output to.
     */


    SpriteMaskFilter.prototype.apply = function apply(filterManager, input, output) {
        var maskSprite = this.maskSprite;
        var tex = this.maskSprite.texture;

        if (!tex.valid) {
            return;
        }
        if (!tex.transform) {
            // margin = 0.0, let it bleed a bit, shader code becomes easier
            // assuming that atlas textures were made with 1-pixel padding
            tex.transform = new _TextureMatrix2.default(tex, 0.0);
        }
        tex.transform.update();

        this.uniforms.mask = tex;
        this.uniforms.otherMatrix = filterManager.calculateSpriteMatrix(this.maskMatrix, maskSprite).prepend(tex.transform.mapCoord);
        this.uniforms.alpha = maskSprite.worldAlpha;
        this.uniforms.maskClamp = tex.transform.uClampFrame;

        filterManager.applyFilter(this, input, output);
    };

    return SpriteMaskFilter;
}(_Filter3.default);

exports.default = SpriteMaskFilter;
//# sourceMappingURL=SpriteMaskFilter.js.map