/*!
 * pixi.js - v5.2.4
 * Compiled Sun, 03 May 2020 22:38:52 UTC
 *
 * pixi.js is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

require('@pixi/polyfill');
var accessibility = require('@pixi/accessibility');
var interaction = require('@pixi/interaction');
var utils = require('@pixi/utils');
var app = require('@pixi/app');
var core = require('@pixi/core');
var extract = require('@pixi/extract');
var loaders = require('@pixi/loaders');
var particles = require('@pixi/particles');
var prepare = require('@pixi/prepare');
var spritesheet = require('@pixi/spritesheet');
var spriteTiling = require('@pixi/sprite-tiling');
var textBitmap = require('@pixi/text-bitmap');
var ticker = require('@pixi/ticker');
var filterAlpha = require('@pixi/filter-alpha');
var filterBlur = require('@pixi/filter-blur');
var filterColorMatrix = require('@pixi/filter-color-matrix');
var filterDisplacement = require('@pixi/filter-displacement');
var filterFxaa = require('@pixi/filter-fxaa');
var filterNoise = require('@pixi/filter-noise');
require('@pixi/mixin-cache-as-bitmap');
require('@pixi/mixin-get-child-by-name');
require('@pixi/mixin-get-global-position');
var constants = require('@pixi/constants');
var display = require('@pixi/display');
var graphics = require('@pixi/graphics');
var math = require('@pixi/math');
var mesh = require('@pixi/mesh');
var meshExtras = require('@pixi/mesh-extras');
var runner = require('@pixi/runner');
var sprite = require('@pixi/sprite');
var spriteAnimated = require('@pixi/sprite-animated');
var text = require('@pixi/text');
var settings = require('@pixi/settings');

var v5 = '5.0.0';

/**
 * Deprecations (backward compatibilities) are automatically applied for browser bundles
 * in the UMD module format. If using Webpack or Rollup, you'll need to apply these
 * deprecations manually by doing something like this:
 * @example
 * import * as PIXI from 'pixi.js';
 * PIXI.useDeprecated(); // MUST be bound to namespace
 * @memberof PIXI
 * @function useDeprecated
 */
function useDeprecated()
{
    var PIXI = this;

    Object.defineProperties(PIXI, {
        /**
         * @constant {RegExp|string} SVG_SIZE
         * @memberof PIXI
         * @see PIXI.resources.SVGResource.SVG_SIZE
         * @deprecated since 5.0.0
         */
        SVG_SIZE: {
            get: function get()
            {
                utils.deprecation(v5, 'PIXI.utils.SVG_SIZE property has moved to PIXI.resources.SVGResource.SVG_SIZE');

                return PIXI.SVGResource.SVG_SIZE;
            },
        },

        /**
         * @class PIXI.TransformStatic
         * @deprecated since 5.0.0
         * @see PIXI.Transform
         */
        TransformStatic: {
            get: function get()
            {
                utils.deprecation(v5, 'PIXI.TransformStatic class has been removed, use PIXI.Transform');

                return PIXI.Transform;
            },
        },

        /**
         * @class PIXI.TransformBase
         * @deprecated since 5.0.0
         * @see PIXI.Transform
         */
        TransformBase: {
            get: function get()
            {
                utils.deprecation(v5, 'PIXI.TransformBase class has been removed, use PIXI.Transform');

                return PIXI.Transform;
            },
        },

        /**
         * Constants that specify the transform type.
         *
         * @static
         * @constant
         * @name TRANSFORM_MODE
         * @memberof PIXI
         * @enum {number}
         * @deprecated since 5.0.0
         * @property {number} STATIC
         * @property {number} DYNAMIC
         */
        TRANSFORM_MODE: {
            get: function get()
            {
                utils.deprecation(v5, 'PIXI.TRANSFORM_MODE property has been removed');

                return { STATIC: 0, DYNAMIC: 1 };
            },
        },

        /**
         * @class PIXI.WebGLRenderer
         * @see PIXI.Renderer
         * @deprecated since 5.0.0
         */
        WebGLRenderer: {
            get: function get()
            {
                utils.deprecation(v5, 'PIXI.WebGLRenderer class has moved to PIXI.Renderer');

                return PIXI.Renderer;
            },
        },

        /**
         * @class PIXI.CanvasRenderTarget
         * @see PIXI.utils.CanvasRenderTarget
         * @deprecated since 5.0.0
         */
        CanvasRenderTarget: {
            get: function get()
            {
                utils.deprecation(v5, 'PIXI.CanvasRenderTarget class has moved to PIXI.utils.CanvasRenderTarget');

                return PIXI.utils.CanvasRenderTarget;
            },
        },

        /**
         * @memberof PIXI
         * @name loader
         * @type {PIXI.Loader}
         * @see PIXI.Loader.shared
         * @deprecated since 5.0.0
         */
        loader: {
            get: function get()
            {
                utils.deprecation(v5, 'PIXI.loader instance has moved to PIXI.Loader.shared');

                return PIXI.Loader.shared;
            },
        },

        /**
         * @class PIXI.FilterManager
         * @see PIXI.systems.FilterSystem
         * @deprecated since 5.0.0
         */
        FilterManager: {
            get: function get()
            {
                utils.deprecation(v5, 'PIXI.FilterManager class has moved to PIXI.systems.FilterSystem');

                return PIXI.systems.FilterSystem;
            },
        },

        /**
         * @namespace PIXI.CanvasTinter
         * @see PIXI.canvasUtils
         * @deprecated since 5.2.0
         */
        CanvasTinter: {
            get: function get()
            {
                utils.deprecation('5.2.0', 'PIXI.CanvasTinter namespace has moved to PIXI.canvasUtils');

                return PIXI.canvasUtils;
            },
        },

        /**
         * @namespace PIXI.GroupD8
         * @see PIXI.groupD8
         * @deprecated since 5.2.0
         */
        GroupD8: {
            get: function get()
            {
                utils.deprecation('5.2.0', 'PIXI.GroupD8 namespace has moved to PIXI.groupD8');

                return PIXI.groupD8;
            },
        },
    });

    /**
     * @namespace PIXI.prepare
     * @see PIXI
     * @deprecated since 5.2.1
     */
    PIXI.prepare = {};

    Object.defineProperties(PIXI.prepare, {
        /**
         * @class PIXI.prepare.BasePrepare
         * @deprecated since 5.2.1
         * @see PIXI.BasePrepare
         */
        BasePrepare: {
            get: function get()
            {
                utils.deprecation('5.2.1', 'PIXI.prepare.BasePrepare moved to PIXI.BasePrepare');

                return PIXI.BasePrepare;
            },
        },
        /**
         * @class PIXI.prepare.Prepare
         * @deprecated since 5.2.1
         * @see PIXI.Prepare
         */
        Prepare: {
            get: function get()
            {
                utils.deprecation('5.2.1', 'PIXI.prepare.Prepare moved to PIXI.Prepare');

                return PIXI.Prepare;
            },
        },
        /**
         * @class PIXI.prepare.CanvasPrepare
         * @deprecated since 5.2.1
         * @see PIXI.CanvasPrepare
         */
        CanvasPrepare: {
            get: function get()
            {
                utils.deprecation('5.2.1', 'PIXI.prepare.CanvasPrepare moved to PIXI.CanvasPrepare');

                return PIXI.CanvasPrepare;
            },
        },
    });

    /**
     * @namespace PIXI.extract
     * @see PIXI
     * @deprecated since 5.2.1
     */
    PIXI.extract = {};

    Object.defineProperties(PIXI.extract, {
        /**
         * @class PIXI.extract.Extract
         * @deprecated since 5.2.1
         * @see PIXI.Extract
         */
        Extract: {
            get: function get()
            {
                utils.deprecation('5.2.1', 'PIXI.extract.Extract moved to PIXI.Extract');

                return PIXI.Extract;
            },
        },
        /**
         * @class PIXI.extract.CanvasExtract
         * @deprecated since 5.2.1
         * @see PIXI.CanvasExtract
         */
        CanvasExtract: {
            get: function get()
            {
                utils.deprecation('5.2.1', 'PIXI.extract.CanvasExtract moved to PIXI.CanvasExtract');

                return PIXI.CanvasExtract;
            },
        },
    });

    /**
     * This namespace has been removed. All classes previous nested
     * under this namespace have been moved to the top-level `PIXI` object.
     * @namespace PIXI.extras
     * @deprecated since 5.0.0
     */
    PIXI.extras = {};

    Object.defineProperties(PIXI.extras, {
        /**
         * @class PIXI.extras.TilingSprite
         * @see PIXI.TilingSprite
         * @deprecated since 5.0.0
         */
        TilingSprite: {
            get: function get()
            {
                utils.deprecation(v5, 'PIXI.extras.TilingSprite class has moved to PIXI.TilingSprite');

                return PIXI.TilingSprite;
            },
        },
        /**
         * @class PIXI.extras.TilingSpriteRenderer
         * @see PIXI.TilingSpriteRenderer
         * @deprecated since 5.0.0
         */
        TilingSpriteRenderer: {
            get: function get()
            {
                utils.deprecation(v5, 'PIXI.extras.TilingSpriteRenderer class has moved to PIXI.TilingSpriteRenderer');

                return PIXI.TilingSpriteRenderer;
            },
        },
        /**
         * @class PIXI.extras.AnimatedSprite
         * @see PIXI.AnimatedSprite
         * @deprecated since 5.0.0
         */
        AnimatedSprite: {
            get: function get()
            {
                utils.deprecation(v5, 'PIXI.extras.AnimatedSprite class has moved to PIXI.AnimatedSprite');

                return PIXI.AnimatedSprite;
            },
        },
        /**
         * @class PIXI.extras.BitmapText
         * @see PIXI.BitmapText
         * @deprecated since 5.0.0
         */
        BitmapText: {
            get: function get()
            {
                utils.deprecation(v5, 'PIXI.extras.BitmapText class has moved to PIXI.BitmapText');

                return PIXI.BitmapText;
            },
        },
    });

    Object.defineProperties(PIXI.utils, {
        /**
         * @function PIXI.utils.getSvgSize
         * @see PIXI.resources.SVGResource.getSize
         * @deprecated since 5.0.0
         */
        getSvgSize: {
            get: function get()
            {
                utils.deprecation(v5, 'PIXI.utils.getSvgSize function has moved to PIXI.resources.SVGResource.getSize');

                return PIXI.SVGResource.getSize;
            },
        },
    });

    /**
     * All classes on this namespace have moved to the high-level `PIXI` object.
     * @namespace PIXI.mesh
     * @deprecated since 5.0.0
     */
    PIXI.mesh = {};

    Object.defineProperties(PIXI.mesh, {
        /**
         * @class PIXI.mesh.Mesh
         * @see PIXI.SimpleMesh
         * @deprecated since 5.0.0
         */
        Mesh: {
            get: function get()
            {
                utils.deprecation(v5, 'PIXI.mesh.Mesh class has moved to PIXI.SimpleMesh');

                return PIXI.SimpleMesh;
            },
        },
        /**
         * @class PIXI.mesh.NineSlicePlane
         * @see PIXI.NineSlicePlane
         * @deprecated since 5.0.0
         */
        NineSlicePlane: {
            get: function get()
            {
                utils.deprecation(v5, 'PIXI.mesh.NineSlicePlane class has moved to PIXI.NineSlicePlane');

                return PIXI.NineSlicePlane;
            },
        },
        /**
         * @class PIXI.mesh.Plane
         * @see PIXI.SimplePlane
         * @deprecated since 5.0.0
         */
        Plane: {
            get: function get()
            {
                utils.deprecation(v5, 'PIXI.mesh.Plane class has moved to PIXI.SimplePlane');

                return PIXI.SimplePlane;
            },
        },
        /**
         * @class PIXI.mesh.Rope
         * @see PIXI.SimpleRope
         * @deprecated since 5.0.0
         */
        Rope: {
            get: function get()
            {
                utils.deprecation(v5, 'PIXI.mesh.Rope class has moved to PIXI.SimpleRope');

                return PIXI.SimpleRope;
            },
        },
        /**
         * @class PIXI.mesh.RawMesh
         * @see PIXI.Mesh
         * @deprecated since 5.0.0
         */
        RawMesh: {
            get: function get()
            {
                utils.deprecation(v5, 'PIXI.mesh.RawMesh class has moved to PIXI.Mesh');

                return PIXI.Mesh;
            },
        },
        /**
         * @class PIXI.mesh.CanvasMeshRenderer
         * @see PIXI.CanvasMeshRenderer
         * @deprecated since 5.0.0
         */
        CanvasMeshRenderer: {
            get: function get()
            {
                utils.deprecation(v5, 'PIXI.mesh.CanvasMeshRenderer class has moved to PIXI.CanvasMeshRenderer');

                return PIXI.CanvasMeshRenderer;
            },
        },
        /**
         * @class PIXI.mesh.MeshRenderer
         * @see PIXI.MeshRenderer
         * @deprecated since 5.0.0
         */
        MeshRenderer: {
            get: function get()
            {
                utils.deprecation(v5, 'PIXI.mesh.MeshRenderer class has moved to PIXI.MeshRenderer');

                return PIXI.MeshRenderer;
            },
        },
    });

    /**
     * This namespace has been removed and items have been moved to
     * the top-level `PIXI` object.
     * @namespace PIXI.particles
     * @deprecated since 5.0.0
     */
    PIXI.particles = {};

    Object.defineProperties(PIXI.particles, {
        /**
         * @class PIXI.particles.ParticleContainer
         * @deprecated since 5.0.0
         * @see PIXI.ParticleContainer
         */
        ParticleContainer: {
            get: function get()
            {
                utils.deprecation(v5, 'PIXI.particles.ParticleContainer class has moved to PIXI.ParticleContainer');

                return PIXI.ParticleContainer;
            },
        },
        /**
         * @class PIXI.particles.ParticleRenderer
         * @deprecated since 5.0.0
         * @see PIXI.ParticleRenderer
         */
        ParticleRenderer: {
            get: function get()
            {
                utils.deprecation(v5, 'PIXI.particles.ParticleRenderer class has moved to PIXI.ParticleRenderer');

                return PIXI.ParticleRenderer;
            },
        },
    });

    /**
     * This namespace has been removed and items have been moved to
     * the top-level `PIXI` object.
     * @namespace PIXI.ticker
     * @deprecated since 5.0.0
     */
    PIXI.ticker = {};

    Object.defineProperties(PIXI.ticker, {
        /**
         * @class PIXI.ticker.Ticker
         * @deprecated since 5.0.0
         * @see PIXI.Ticker
         */
        Ticker: {
            get: function get()
            {
                utils.deprecation(v5, 'PIXI.ticker.Ticker class has moved to PIXI.Ticker');

                return PIXI.Ticker;
            },
        },
        /**
         * @name PIXI.ticker.shared
         * @type {PIXI.Ticker}
         * @deprecated since 5.0.0
         * @see PIXI.Ticker.shared
         */
        shared: {
            get: function get()
            {
                utils.deprecation(v5, 'PIXI.ticker.shared instance has moved to PIXI.Ticker.shared');

                return PIXI.Ticker.shared;
            },
        },
    });

    /**
     * All classes on this namespace have moved to the high-level `PIXI` object.
     * @namespace PIXI.loaders
     * @deprecated since 5.0.0
     */
    PIXI.loaders = {};

    Object.defineProperties(PIXI.loaders, {
        /**
         * @class PIXI.loaders.Loader
         * @see PIXI.Loader
         * @deprecated since 5.0.0
         */
        Loader: {
            get: function get()
            {
                utils.deprecation(v5, 'PIXI.loaders.Loader class has moved to PIXI.Loader');

                return PIXI.Loader;
            },
        },
        /**
         * @class PIXI.loaders.Resource
         * @see PIXI.LoaderResource
         * @deprecated since 5.0.0
         */
        Resource: {
            get: function get()
            {
                utils.deprecation(v5, 'PIXI.loaders.Resource class has moved to PIXI.LoaderResource');

                return PIXI.LoaderResource;
            },
        },
        /**
         * @function PIXI.loaders.bitmapFontParser
         * @see PIXI.BitmapFontLoader.use
         * @deprecated since 5.0.0
         */
        bitmapFontParser: {
            get: function get()
            {
                utils.deprecation(v5, 'PIXI.loaders.bitmapFontParser function has moved to PIXI.BitmapFontLoader.use');

                return PIXI.BitmapFontLoader.use;
            },
        },
        /**
         * @function PIXI.loaders.parseBitmapFontData
         * @see PIXI.BitmapFontLoader.parse
         * @deprecated since 5.0.0
         */
        parseBitmapFontData: {
            get: function get()
            {
                utils.deprecation(v5, 'PIXI.loaders.parseBitmapFontData function has moved to PIXI.BitmapFontLoader.parse');

                return PIXI.BitmapFontLoader.parse;
            },
        },
        /**
         * @function PIXI.loaders.spritesheetParser
         * @see PIXI.SpritesheetLoader.use
         * @deprecated since 5.0.0
         */
        spritesheetParser: {
            get: function get()
            {
                utils.deprecation(v5, 'PIXI.loaders.spritesheetParser function has moved to PIXI.SpritesheetLoader.use');

                return PIXI.SpritesheetLoader.use;
            },
        },
        /**
         * @function PIXI.loaders.getResourcePath
         * @see PIXI.SpritesheetLoader.getResourcePath
         * @deprecated since 5.0.0
         */
        getResourcePath: {
            get: function get()
            {
                utils.deprecation(v5, 'PIXI.loaders.getResourcePath property has moved to PIXI.SpritesheetLoader.getResourcePath');

                return PIXI.SpritesheetLoader.getResourcePath;
            },
        },
    });

    /**
     * @function PIXI.loaders.Loader.addPixiMiddleware
     * @see PIXI.Loader.registerPlugin
     * @deprecated since 5.0.0
     * @param {function} middleware
     */
    PIXI.Loader.addPixiMiddleware = function addPixiMiddleware(middleware)
    {
        utils.deprecation(v5,
            'PIXI.loaders.Loader.addPixiMiddleware function is deprecated, use PIXI.loaders.Loader.registerPlugin'
        );

        return PIXI.loaders.Loader.registerPlugin({ use: middleware() });
    };

    /**
     * @class PIXI.extract.WebGLExtract
     * @deprecated since 5.0.0
     * @see PIXI.Extract
     */
    Object.defineProperty(PIXI.extract, 'WebGLExtract', {
        get: function get()
        {
            utils.deprecation(v5, 'PIXI.extract.WebGLExtract method has moved to PIXI.Extract');

            return PIXI.Extract;
        },
    });

    /**
     * @class PIXI.prepare.WebGLPrepare
     * @deprecated since 5.0.0
     * @see PIXI.Prepare
     */
    Object.defineProperty(PIXI.prepare, 'WebGLPrepare', {
        get: function get()
        {
            utils.deprecation(v5, 'PIXI.prepare.WebGLPrepare class has moved to PIXI.Prepare');

            return PIXI.Prepare;
        },
    });

    /**
     * @method PIXI.Container#_renderWebGL
     * @private
     * @deprecated since 5.0.0
     * @see PIXI.Container#render
     * @param {PIXI.Renderer} renderer Instance of renderer
     */
    PIXI.Container.prototype._renderWebGL = function _renderWebGL(renderer)
    {
        utils.deprecation(v5, 'PIXI.Container._renderWebGL method has moved to PIXI.Container._render');

        this._render(renderer);
    };

    /**
     * @method PIXI.Container#renderWebGL
     * @deprecated since 5.0.0
     * @see PIXI.Container#render
     * @param {PIXI.Renderer} renderer Instance of renderer
     */
    PIXI.Container.prototype.renderWebGL = function renderWebGL(renderer)
    {
        utils.deprecation(v5, 'PIXI.Container.renderWebGL method has moved to PIXI.Container.render');

        this.render(renderer);
    };

    /**
     * @method PIXI.DisplayObject#renderWebGL
     * @deprecated since 5.0.0
     * @see PIXI.DisplayObject#render
     * @param {PIXI.Renderer} renderer Instance of renderer
     */
    PIXI.DisplayObject.prototype.renderWebGL = function renderWebGL(renderer)
    {
        utils.deprecation(v5, 'PIXI.DisplayObject.renderWebGL method has moved to PIXI.DisplayObject.render');

        this.render(renderer);
    };

    /**
     * @method PIXI.Container#renderAdvancedWebGL
     * @deprecated since 5.0.0
     * @see PIXI.Container#renderAdvanced
     * @param {PIXI.Renderer} renderer Instance of renderer
     */
    PIXI.Container.prototype.renderAdvancedWebGL = function renderAdvancedWebGL(renderer)
    {
        utils.deprecation(v5, 'PIXI.Container.renderAdvancedWebGL method has moved to PIXI.Container.renderAdvanced');

        this.renderAdvanced(renderer);
    };

    Object.defineProperties(PIXI.settings, {
        /**
         * Default transform type.
         *
         * @static
         * @deprecated since 5.0.0
         * @memberof PIXI.settings
         * @type {PIXI.TRANSFORM_MODE}
         * @default PIXI.TRANSFORM_MODE.STATIC
         */
        TRANSFORM_MODE: {
            get: function get()
            {
                utils.deprecation(v5, 'PIXI.settings.TRANSFORM_MODE property has been removed');

                return 0;
            },
            set: function set()
            {
                utils.deprecation(v5, 'PIXI.settings.TRANSFORM_MODE property has been removed');
            },
        },
    });

    var BaseTexture = PIXI.BaseTexture;

    /**
     * @method loadSource
     * @memberof PIXI.BaseTexture#
     * @deprecated since 5.0.0
     */
    BaseTexture.prototype.loadSource = function loadSource(image)
    {
        utils.deprecation(v5, 'PIXI.BaseTexture.loadSource method has been deprecated');

        var resource = PIXI.resources.autoDetectResource(image);

        resource.internal = true;

        this.setResource(resource);
        this.update();
    };

    var baseTextureIdDeprecation = false;

    Object.defineProperties(BaseTexture.prototype, {
        /**
         * @name PIXI.BaseTexture#hasLoaded
         * @type {boolean}
         * @deprecated since 5.0.0
         * @readonly
         * @see PIXI.BaseTexture#valid
         */
        hasLoaded: {
            get: function get()
            {
                utils.deprecation(v5, 'PIXI.BaseTexture.hasLoaded property has been removed, use PIXI.BaseTexture.valid');

                return this.valid;
            },
        },
        /**
         * @name PIXI.BaseTexture#imageUrl
         * @type {string}
         * @deprecated since 5.0.0
         * @see PIXI.resource.ImageResource#url
         */
        imageUrl: {
            get: function get()
            {
                utils.deprecation(v5, 'PIXI.BaseTexture.imageUrl property has been removed, use PIXI.BaseTexture.resource.url');

                return this.resource && this.resource.url;
            },

            set: function set(imageUrl)
            {
                utils.deprecation(v5, 'PIXI.BaseTexture.imageUrl property has been removed, use PIXI.BaseTexture.resource.url');

                if (this.resource)
                {
                    this.resource.url = imageUrl;
                }
            },
        },
        /**
         * @name PIXI.BaseTexture#source
         * @type {HTMLImageElement|HTMLCanvasElement|HTMLVideoElement|SVGElement}
         * @deprecated since 5.0.0
         * @readonly
         * @see PIXI.resources.BaseImageResource#source
         */
        source: {
            get: function get()
            {
                utils.deprecation(v5, 'PIXI.BaseTexture.source property has been moved, use `PIXI.BaseTexture.resource.source`');

                return this.resource && this.resource.source;
            },
            set: function set(source)
            {
                utils.deprecation(v5, 'PIXI.BaseTexture.source property has been moved, use `PIXI.BaseTexture.resource.source` '
                    + 'if you want to set HTMLCanvasElement. Otherwise, create new BaseTexture.');

                if (this.resource)
                {
                    this.resource.source = source;
                }
            },
        },

        /**
         * @name PIXI.BaseTexture#premultiplyAlpha
         * @type {boolean}
         * @deprecated since 5.2.0
         * @readonly
         * @see PIXI.BaseTexture#alphaMode
         */
        premultiplyAlpha: {
            get: function get()
            {
                utils.deprecation('5.2.0', 'PIXI.BaseTexture.premultiplyAlpha property has been changed to `alphaMode`'
                    + ', see `PIXI.ALPHA_MODES`');

                return this.alphaMode !== 0;
            },
            set: function set(value)
            {
                utils.deprecation('5.2.0', 'PIXI.BaseTexture.premultiplyAlpha property has been changed to `alphaMode`'
                    + ', see `PIXI.ALPHA_MODES`');

                this.alphaMode = Number(value);
            },
        },
        /**
         * Batch local field, stores current texture location
         *
         * @name PIXI.BaseTexture#_id
         * @deprecated since 5.2.0
         * @type {number}
         * @see PIXI.BaseTexture#_batchLocation
         */
        _id: {
            get: function get()
            {
                if (!baseTextureIdDeprecation)
                {
                    // #popelyshev: That property was a hot place, I don't want to call deprecation method on it if possible
                    utils.deprecation('5.2.0', 'PIXI.BaseTexture._id batch local field has been changed to `_batchLocation`');
                    baseTextureIdDeprecation = true;
                }

                return this._batchLocation;
            },
            set: function set(value)
            {
                this._batchLocation = value;
            },
        },
    });

    /**
     * @method fromImage
     * @static
     * @memberof PIXI.BaseTexture
     * @deprecated since 5.0.0
     * @see PIXI.BaseTexture.from
     */
    BaseTexture.fromImage = function fromImage(canvas, crossorigin, scaleMode, scale)
    {
        utils.deprecation(v5, 'PIXI.BaseTexture.fromImage method has been replaced with PIXI.BaseTexture.from');

        var resourceOptions = { scale: scale, crossorigin: crossorigin };

        return BaseTexture.from(canvas, { scaleMode: scaleMode, resourceOptions: resourceOptions });
    };

    /**
     * @method fromCanvas
     * @static
     * @memberof PIXI.BaseTexture
     * @deprecated since 5.0.0
     * @see PIXI.BaseTexture.from
     */
    BaseTexture.fromCanvas = function fromCanvas(canvas, scaleMode)
    {
        utils.deprecation(v5, 'PIXI.BaseTexture.fromCanvas method has been replaced with PIXI.BaseTexture.from');

        return BaseTexture.from(canvas, { scaleMode: scaleMode });
    };

    /**
     * @method fromSVG
     * @static
     * @memberof PIXI.BaseTexture
     * @deprecated since 5.0.0
     * @see PIXI.BaseTexture.from
     */
    BaseTexture.fromSVG = function fromSVG(canvas, crossorigin, scaleMode, scale)
    {
        utils.deprecation(v5, 'PIXI.BaseTexture.fromSVG method has been replaced with PIXI.BaseTexture.from');

        var resourceOptions = { scale: scale, crossorigin: crossorigin };

        return BaseTexture.from(canvas, { scaleMode: scaleMode, resourceOptions: resourceOptions });
    };

    Object.defineProperties(PIXI.resources.ImageResource.prototype, {
        /**
         * @name PIXI.resources.ImageResource#premultiplyAlpha
         * @type {boolean}
         * @deprecated since 5.2.0
         * @readonly
         * @see PIXI.resources.ImageResource#alphaMode
         */
        premultiplyAlpha: {
            get: function get()
            {
                utils.deprecation('5.2.0', 'PIXI.resources.ImageResource.premultiplyAlpha property '
                    + 'has been changed to `alphaMode`, see `PIXI.ALPHA_MODES`');

                return this.alphaMode !== 0;
            },
            set: function set(value)
            {
                utils.deprecation('5.2.0', 'PIXI.resources.ImageResource.premultiplyAlpha property '
                    + 'has been changed to `alphaMode`, see `PIXI.ALPHA_MODES`');
                this.alphaMode = Number(value);
            },
        },
    });

    /**
     * @method PIXI.Point#copy
     * @deprecated since 5.0.0
     * @see PIXI.Point#copyFrom
     */
    PIXI.Point.prototype.copy = function copy(p)
    {
        utils.deprecation(v5, 'PIXI.Point.copy method has been replaced with PIXI.Point.copyFrom');

        return this.copyFrom(p);
    };

    /**
     * @method PIXI.ObservablePoint#copy
     * @deprecated since 5.0.0
     * @see PIXI.ObservablePoint#copyFrom
     */
    PIXI.ObservablePoint.prototype.copy = function copy(p)
    {
        utils.deprecation(v5, 'PIXI.ObservablePoint.copy method has been replaced with PIXI.ObservablePoint.copyFrom');

        return this.copyFrom(p);
    };

    /**
     * @method PIXI.Rectangle#copy
     * @deprecated since 5.0.0
     * @see PIXI.Rectangle#copyFrom
     */
    PIXI.Rectangle.prototype.copy = function copy(p)
    {
        utils.deprecation(v5, 'PIXI.Rectangle.copy method has been replaced with PIXI.Rectangle.copyFrom');

        return this.copyFrom(p);
    };

    /**
     * @method PIXI.Matrix#copy
     * @deprecated since 5.0.0
     * @see PIXI.Matrix#copyTo
     */
    PIXI.Matrix.prototype.copy = function copy(p)
    {
        utils.deprecation(v5, 'PIXI.Matrix.copy method has been replaced with PIXI.Matrix.copyTo');

        return this.copyTo(p);
    };

    /**
     * @method PIXI.systems.StateSystem#setState
     * @deprecated since 5.1.0
     * @see PIXI.systems.StateSystem#set
     */
    PIXI.systems.StateSystem.prototype.setState = function setState(s)
    {
        utils.deprecation('v5.1.0', 'StateSystem.setState has been renamed to StateSystem.set');

        return this.set(s);
    };

    Object.assign(PIXI.systems.FilterSystem.prototype, {
        /**
         * @method PIXI.FilterManager#getRenderTarget
         * @deprecated since 5.0.0
         * @see PIXI.systems.FilterSystem#getFilterTexture
         */
        getRenderTarget: function getRenderTarget(clear, resolution)
        {
            utils.deprecation(v5,
                'PIXI.FilterManager.getRenderTarget method has been replaced with PIXI.systems.FilterSystem#getFilterTexture'
            );

            return this.getFilterTexture(resolution);
        },

        /**
         * @method PIXI.FilterManager#returnRenderTarget
         * @deprecated since 5.0.0
         * @see PIXI.systems.FilterSystem#returnFilterTexture
         */
        returnRenderTarget: function returnRenderTarget(renderTexture)
        {
            utils.deprecation(v5,
                'PIXI.FilterManager.returnRenderTarget method has been replaced with '
                + 'PIXI.systems.FilterSystem.returnFilterTexture'
            );

            this.returnFilterTexture(renderTexture);
        },

        /**
         * @method PIXI.systems.FilterSystem#calculateScreenSpaceMatrix
         * @deprecated since 5.0.0
         * @param {PIXI.Matrix} outputMatrix - the matrix to output to.
         * @return {PIXI.Matrix} The mapped matrix.
         */
        calculateScreenSpaceMatrix: function calculateScreenSpaceMatrix(outputMatrix)
        {
            utils.deprecation(v5, 'PIXI.systems.FilterSystem.calculateScreenSpaceMatrix method is removed, '
                + 'use `(vTextureCoord * inputSize.xy) + outputFrame.xy` instead');

            var mappedMatrix = outputMatrix.identity();
            var ref = this.activeState;
            var sourceFrame = ref.sourceFrame;
            var destinationFrame = ref.destinationFrame;

            mappedMatrix.translate(sourceFrame.x / destinationFrame.width, sourceFrame.y / destinationFrame.height);
            mappedMatrix.scale(destinationFrame.width, destinationFrame.height);

            return mappedMatrix;
        },

        /**
         * @method PIXI.systems.FilterSystem#calculateNormalizedScreenSpaceMatrix
         * @deprecated since 5.0.0
         * @param {PIXI.Matrix} outputMatrix - The matrix to output to.
         * @return {PIXI.Matrix} The mapped matrix.
         */
        calculateNormalizedScreenSpaceMatrix: function calculateNormalizedScreenSpaceMatrix(outputMatrix)
        {
            utils.deprecation(v5, 'PIXI.systems.FilterManager.calculateNormalizedScreenSpaceMatrix method is removed, '
                + 'use `((vTextureCoord * inputSize.xy) + outputFrame.xy) / outputFrame.zw` instead.');

            var ref = this.activeState;
            var sourceFrame = ref.sourceFrame;
            var destinationFrame = ref.destinationFrame;
            var mappedMatrix = outputMatrix.identity();

            mappedMatrix.translate(sourceFrame.x / destinationFrame.width, sourceFrame.y / destinationFrame.height);

            var translateScaleX = (destinationFrame.width / sourceFrame.width);
            var translateScaleY = (destinationFrame.height / sourceFrame.height);

            mappedMatrix.scale(translateScaleX, translateScaleY);

            return mappedMatrix;
        },
    });

    Object.defineProperties(PIXI.RenderTexture.prototype, {
        /**
         * @name PIXI.RenderTexture#sourceFrame
         * @type {PIXI.Rectangle}
         * @deprecated since 5.0.0
         * @readonly
         */
        sourceFrame: {
            get: function get()
            {
                utils.deprecation(v5, 'PIXI.RenderTexture.sourceFrame property has been removed');

                return this.filterFrame;
            },
        },
        /**
         * @name PIXI.RenderTexture#size
         * @type {PIXI.Rectangle}
         * @deprecated since 5.0.0
         * @readonly
         */
        size: {
            get: function get()
            {
                utils.deprecation(v5, 'PIXI.RenderTexture.size property has been removed');

                return this._frame;
            },
        },
    });

    /**
     * @class BlurXFilter
     * @memberof PIXI.filters
     * @deprecated since 5.0.0
     * @see PIXI.filters.BlurFilterPass
     */
    var BlurXFilter = /*@__PURE__*/(function (superclass) {
        function BlurXFilter(strength, quality, resolution, kernelSize)
        {
            utils.deprecation(v5, 'PIXI.filters.BlurXFilter class is deprecated, use PIXI.filters.BlurFilterPass');

            superclass.call(this, true, strength, quality, resolution, kernelSize);
        }

        if ( superclass ) BlurXFilter.__proto__ = superclass;
        BlurXFilter.prototype = Object.create( superclass && superclass.prototype );
        BlurXFilter.prototype.constructor = BlurXFilter;

        return BlurXFilter;
    }(PIXI.filters.BlurFilterPass));

    /**
     * @class BlurYFilter
     * @memberof PIXI.filters
     * @deprecated since 5.0.0
     * @see PIXI.filters.BlurFilterPass
     */
    var BlurYFilter = /*@__PURE__*/(function (superclass) {
        function BlurYFilter(strength, quality, resolution, kernelSize)
        {
            utils.deprecation(v5, 'PIXI.filters.BlurYFilter class is deprecated, use PIXI.filters.BlurFilterPass');

            superclass.call(this, false, strength, quality, resolution, kernelSize);
        }

        if ( superclass ) BlurYFilter.__proto__ = superclass;
        BlurYFilter.prototype = Object.create( superclass && superclass.prototype );
        BlurYFilter.prototype.constructor = BlurYFilter;

        return BlurYFilter;
    }(PIXI.filters.BlurFilterPass));

    Object.assign(PIXI.filters, {
        BlurXFilter: BlurXFilter,
        BlurYFilter: BlurYFilter,
    });

    var Sprite = PIXI.Sprite;
    var Texture = PIXI.Texture;
    var Graphics = PIXI.Graphics;

    // Support for pixi.js-legacy bifurcation
    // give users a friendly assist to use legacy
    if (!Graphics.prototype.generateCanvasTexture)
    {
        Graphics.prototype.generateCanvasTexture = function generateCanvasTexture()
        {
            utils.deprecation(v5, 'PIXI.Graphics.generateCanvasTexture method is only available in "pixi.js-legacy"');
        };
    }

    /**
     * @deprecated since 5.0.0
     * @member {PIXI.Graphics} PIXI.Graphics#graphicsData
     * @see PIXI.Graphics#geometry
     * @readonly
     */
    Object.defineProperty(PIXI.Graphics.prototype, 'graphicsData', {
        get: function get()
        {
            utils.deprecation(v5, 'PIXI.Graphics.graphicsData property is deprecated, use PIXI.Graphics.geometry.graphicsData');

            return this.geometry.graphicsData;
        },
    });

    /**
     * @deprecated since 5.0.0
     * @member {PIXI.Point[]} PIXI.SimpleRope#points
     * @see PIXI.Mesh#geometry
     */
    Object.defineProperty(PIXI.SimpleRope.prototype, 'points', {
        get: function get()
        {
            utils.deprecation(v5, 'PIXI.SimpleRope.points property is deprecated, '
                + 'use PIXI.SimpleRope.geometry.points');

            return this.geometry.points;
        },
        set: function set(value)
        {
            utils.deprecation(v5, 'PIXI.SimpleRope.points property is deprecated, '
                + 'use PIXI.SimpleRope.geometry.points');

            this.geometry.points = value;
        },
    });

    // Use these to deprecate all the Sprite from* methods
    function spriteFrom(name, source, crossorigin, scaleMode)
    {
        utils.deprecation(v5, ("PIXI.Sprite." + name + " method is deprecated, use PIXI.Sprite.from"));

        return Sprite.from(source, {
            resourceOptions: {
                scale: scaleMode,
                crossorigin: crossorigin,
            },
        });
    }

    /**
     * @deprecated since 5.0.0
     * @see PIXI.Sprite.from
     * @method PIXI.Sprite.fromImage
     * @return {PIXI.Sprite}
     */
    Sprite.fromImage = spriteFrom.bind(null, 'fromImage');

    /**
     * @deprecated since 5.0.0
     * @method PIXI.Sprite.fromSVG
     * @see PIXI.Sprite.from
     * @return {PIXI.Sprite}
     */
    Sprite.fromSVG = spriteFrom.bind(null, 'fromSVG');

    /**
     * @deprecated since 5.0.0
     * @method PIXI.Sprite.fromCanvas
     * @see PIXI.Sprite.from
     * @return {PIXI.Sprite}
     */
    Sprite.fromCanvas = spriteFrom.bind(null, 'fromCanvas');

    /**
     * @deprecated since 5.0.0
     * @method PIXI.Sprite.fromVideo
     * @see PIXI.Sprite.from
     * @return {PIXI.Sprite}
     */
    Sprite.fromVideo = spriteFrom.bind(null, 'fromVideo');

    /**
     * @deprecated since 5.0.0
     * @method PIXI.Sprite.fromFrame
     * @see PIXI.Sprite.from
     * @return {PIXI.Sprite}
     */
    Sprite.fromFrame = spriteFrom.bind(null, 'fromFrame');

    // Use these to deprecate all the Texture from* methods
    function textureFrom(name, source, crossorigin, scaleMode)
    {
        utils.deprecation(v5, ("PIXI.Texture." + name + " method is deprecated, use PIXI.Texture.from"));

        return Texture.from(source, {
            resourceOptions: {
                scale: scaleMode,
                crossorigin: crossorigin,
            },
        });
    }

    /**
     * @deprecated since 5.0.0
     * @method PIXI.Texture.fromImage
     * @see PIXI.Texture.from
     * @return {PIXI.Texture}
     */
    Texture.fromImage = textureFrom.bind(null, 'fromImage');

    /**
     * @deprecated since 5.0.0
     * @method PIXI.Texture.fromSVG
     * @see PIXI.Texture.from
     * @return {PIXI.Texture}
     */
    Texture.fromSVG = textureFrom.bind(null, 'fromSVG');

    /**
     * @deprecated since 5.0.0
     * @method PIXI.Texture.fromCanvas
     * @see PIXI.Texture.from
     * @return {PIXI.Texture}
     */
    Texture.fromCanvas = textureFrom.bind(null, 'fromCanvas');

    /**
     * @deprecated since 5.0.0
     * @method PIXI.Texture.fromVideo
     * @see PIXI.Texture.from
     * @return {PIXI.Texture}
     */
    Texture.fromVideo = textureFrom.bind(null, 'fromVideo');

    /**
     * @deprecated since 5.0.0
     * @method PIXI.Texture.fromFrame
     * @see PIXI.Texture.from
     * @return {PIXI.Texture}
     */
    Texture.fromFrame = textureFrom.bind(null, 'fromFrame');

    /**
     * @deprecated since 5.0.0
     * @member {boolean} PIXI.AbstractRenderer#autoResize
     * @see PIXI.AbstractRenderer#autoDensity
     */
    Object.defineProperty(PIXI.AbstractRenderer.prototype, 'autoResize', {
        get: function get()
        {
            utils.deprecation(v5, 'PIXI.AbstractRenderer.autoResize property is deprecated, '
                + 'use PIXI.AbstractRenderer.autoDensity');

            return this.autoDensity;
        },
        set: function set(value)
        {
            utils.deprecation(v5, 'PIXI.AbstractRenderer.autoResize property is deprecated, '
                + 'use PIXI.AbstractRenderer.autoDensity');

            this.autoDensity = value;
        },
    });

    /**
     * @deprecated since 5.0.0
     * @member {PIXI.systems.TextureSystem} PIXI.Renderer#textureManager
     * @see PIXI.Renderer#texture
     */
    Object.defineProperty(PIXI.Renderer.prototype, 'textureManager', {
        get: function get()
        {
            utils.deprecation(v5, 'PIXI.Renderer.textureManager property is deprecated, use PIXI.Renderer.texture');

            return this.texture;
        },
    });

    /**
     * @namespace PIXI.utils.mixins
     * @deprecated since 5.0.0
     */
    PIXI.utils.mixins = {
        /**
         * @memberof PIXI.utils.mixins
         * @function mixin
         * @deprecated since 5.0.0
         */
        mixin: function mixin()
        {
            utils.deprecation(v5, 'PIXI.utils.mixins.mixin function is no longer available');
        },
        /**
         * @memberof PIXI.utils.mixins
         * @function delayMixin
         * @deprecated since 5.0.0
         */
        delayMixin: function delayMixin()
        {
            utils.deprecation(v5, 'PIXI.utils.mixins.delayMixin function is no longer available');
        },
        /**
         * @memberof PIXI.utils.mixins
         * @function performMixins
         * @deprecated since 5.0.0
         */
        performMixins: function performMixins()
        {
            utils.deprecation(v5, 'PIXI.utils.mixins.performMixins function is no longer available');
        },
    };
}

// Install renderer plugins
core.Renderer.registerPlugin('accessibility', accessibility.AccessibilityManager);
core.Renderer.registerPlugin('extract', extract.Extract);
core.Renderer.registerPlugin('interaction', interaction.InteractionManager);
core.Renderer.registerPlugin('particle', particles.ParticleRenderer);
core.Renderer.registerPlugin('prepare', prepare.Prepare);
core.Renderer.registerPlugin('batch', core.BatchRenderer);
core.Renderer.registerPlugin('tilingSprite', spriteTiling.TilingSpriteRenderer);

loaders.Loader.registerPlugin(textBitmap.BitmapFontLoader);
loaders.Loader.registerPlugin(spritesheet.SpritesheetLoader);

app.Application.registerPlugin(ticker.TickerPlugin);
app.Application.registerPlugin(loaders.AppLoaderPlugin);

/**
 * String of the current PIXI version.
 *
 * @static
 * @constant
 * @memberof PIXI
 * @name VERSION
 * @type {string}
 */
var VERSION = '5.2.4';

/**
 * @namespace PIXI
 */

/**
 * This namespace contains WebGL-only display filters that can be applied
 * to DisplayObjects using the {@link PIXI.DisplayObject#filters filters} property.
 *
 * Since PixiJS only had a handful of built-in filters, additional filters
 * can be downloaded {@link https://github.com/pixijs/pixi-filters here} from the
 * PixiJS Filters repository.
 *
 * All filters must extend {@link PIXI.Filter}.
 *
 * @example
 * // Create a new application
 * const app = new PIXI.Application();
 *
 * // Draw a green rectangle
 * const rect = new PIXI.Graphics()
 *     .beginFill(0x00ff00)
 *     .drawRect(40, 40, 200, 200);
 *
 * // Add a blur filter
 * rect.filters = [new PIXI.filters.BlurFilter()];
 *
 * // Display rectangle
 * app.stage.addChild(rect);
 * document.body.appendChild(app.view);
 * @namespace PIXI.filters
 */
var filters = {
    AlphaFilter: filterAlpha.AlphaFilter,
    BlurFilter: filterBlur.BlurFilter,
    BlurFilterPass: filterBlur.BlurFilterPass,
    ColorMatrixFilter: filterColorMatrix.ColorMatrixFilter,
    DisplacementFilter: filterDisplacement.DisplacementFilter,
    FXAAFilter: filterFxaa.FXAAFilter,
    NoiseFilter: filterNoise.NoiseFilter,
};

Object.keys(app).forEach(function (key) {
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return app[key];
        }
    });
});
Object.keys(core).forEach(function (key) {
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return core[key];
        }
    });
});
Object.keys(extract).forEach(function (key) {
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return extract[key];
        }
    });
});
Object.keys(loaders).forEach(function (key) {
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return loaders[key];
        }
    });
});
Object.keys(particles).forEach(function (key) {
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return particles[key];
        }
    });
});
Object.keys(prepare).forEach(function (key) {
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return prepare[key];
        }
    });
});
Object.keys(spritesheet).forEach(function (key) {
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return spritesheet[key];
        }
    });
});
Object.keys(spriteTiling).forEach(function (key) {
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return spriteTiling[key];
        }
    });
});
Object.keys(textBitmap).forEach(function (key) {
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return textBitmap[key];
        }
    });
});
Object.keys(ticker).forEach(function (key) {
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return ticker[key];
        }
    });
});
Object.keys(constants).forEach(function (key) {
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return constants[key];
        }
    });
});
Object.keys(display).forEach(function (key) {
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return display[key];
        }
    });
});
Object.keys(graphics).forEach(function (key) {
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return graphics[key];
        }
    });
});
Object.keys(math).forEach(function (key) {
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return math[key];
        }
    });
});
Object.keys(mesh).forEach(function (key) {
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return mesh[key];
        }
    });
});
Object.keys(meshExtras).forEach(function (key) {
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return meshExtras[key];
        }
    });
});
Object.keys(runner).forEach(function (key) {
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return runner[key];
        }
    });
});
Object.keys(sprite).forEach(function (key) {
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return sprite[key];
        }
    });
});
Object.keys(spriteAnimated).forEach(function (key) {
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return spriteAnimated[key];
        }
    });
});
Object.keys(text).forEach(function (key) {
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return text[key];
        }
    });
});
Object.keys(settings).forEach(function (key) {
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return settings[key];
        }
    });
});
exports.accessibility = accessibility;
exports.interaction = interaction;
exports.utils = utils;
exports.VERSION = VERSION;
exports.filters = filters;
exports.useDeprecated = useDeprecated;
//# sourceMappingURL=pixi.js.map
