'use strict';

exports.__esModule = true;

var _const = require('../../../const');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * A set of functions used to handle masking.
 *
 * @class
 * @memberof PIXI
 */
var CanvasMaskManager = function () {
    /**
     * @param {PIXI.CanvasRenderer} renderer - The canvas renderer.
     */
    function CanvasMaskManager(renderer) {
        _classCallCheck(this, CanvasMaskManager);

        this.renderer = renderer;
    }

    /**
     * This method adds it to the current stack of masks.
     *
     * @param {object} maskData - the maskData that will be pushed
     */


    CanvasMaskManager.prototype.pushMask = function pushMask(maskData) {
        var renderer = this.renderer;

        renderer.context.save();

        var cacheAlpha = maskData.alpha;
        var transform = maskData.transform.worldTransform;
        var resolution = renderer.resolution;

        renderer.context.setTransform(transform.a * resolution, transform.b * resolution, transform.c * resolution, transform.d * resolution, transform.tx * resolution, transform.ty * resolution);

        // TODO suport sprite alpha masks??
        // lots of effort required. If demand is great enough..
        if (!maskData._texture) {
            this.renderGraphicsShape(maskData);
            renderer.context.clip();
        }

        maskData.worldAlpha = cacheAlpha;
    };

    /**
     * Renders a PIXI.Graphics shape.
     *
     * @param {PIXI.Graphics} graphics - The object to render.
     */


    CanvasMaskManager.prototype.renderGraphicsShape = function renderGraphicsShape(graphics) {
        var context = this.renderer.context;
        var len = graphics.graphicsData.length;

        if (len === 0) {
            return;
        }

        context.beginPath();

        for (var i = 0; i < len; i++) {
            var data = graphics.graphicsData[i];
            var shape = data.shape;

            if (data.type === _const.SHAPES.POLY) {
                var points = shape.points;
                var holes = data.holes;
                var outerArea = void 0;
                var innerArea = void 0;

                context.moveTo(points[0], points[1]);

                for (var j = 2; j < points.length; j += 2) {
                    context.lineTo(points[j], points[j + 1]);
                }

                // if the first and last point are the same close the path - much neater :)
                if (points[0] === points[points.length - 2] && points[1] === points[points.length - 1]) {
                    context.closePath();
                }

                if (holes.length > 0) {
                    outerArea = 0;
                    for (var _j = 0; _j < points.length; _j += 2) {
                        outerArea += points[_j] * points[_j + 3] - points[_j + 1] * points[_j + 2];
                    }

                    for (var k = 0; k < holes.length; k++) {
                        points = holes[k].points;

                        innerArea = 0;
                        for (var _j2 = 0; _j2 < points.length; _j2 += 2) {
                            innerArea += points[_j2] * points[_j2 + 3] - points[_j2 + 1] * points[_j2 + 2];
                        }

                        context.moveTo(points[0], points[1]);

                        if (innerArea * outerArea < 0) {
                            for (var _j3 = 2; _j3 < points.length; _j3 += 2) {
                                context.lineTo(points[_j3], points[_j3 + 1]);
                            }
                        } else {
                            for (var _j4 = points.length - 2; _j4 >= 2; _j4 -= 2) {
                                context.lineTo(points[_j4], points[_j4 + 1]);
                            }
                        }
                    }
                }
            } else if (data.type === _const.SHAPES.RECT) {
                context.rect(shape.x, shape.y, shape.width, shape.height);
                context.closePath();
            } else if (data.type === _const.SHAPES.CIRC) {
                // TODO - need to be Undefined!
                context.arc(shape.x, shape.y, shape.radius, 0, 2 * Math.PI);
                context.closePath();
            } else if (data.type === _const.SHAPES.ELIP) {
                // ellipse code taken from: http://stackoverflow.com/questions/2172798/how-to-draw-an-oval-in-html5-canvas

                var w = shape.width * 2;
                var h = shape.height * 2;

                var x = shape.x - w / 2;
                var y = shape.y - h / 2;

                var kappa = 0.5522848;
                var ox = w / 2 * kappa; // control point offset horizontal
                var oy = h / 2 * kappa; // control point offset vertical
                var xe = x + w; // x-end
                var ye = y + h; // y-end
                var xm = x + w / 2; // x-middle
                var ym = y + h / 2; // y-middle

                context.moveTo(x, ym);
                context.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
                context.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
                context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
                context.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
                context.closePath();
            } else if (data.type === _const.SHAPES.RREC) {
                var rx = shape.x;
                var ry = shape.y;
                var width = shape.width;
                var height = shape.height;
                var radius = shape.radius;

                var maxRadius = Math.min(width, height) / 2 | 0;

                radius = radius > maxRadius ? maxRadius : radius;

                context.moveTo(rx, ry + radius);
                context.lineTo(rx, ry + height - radius);
                context.quadraticCurveTo(rx, ry + height, rx + radius, ry + height);
                context.lineTo(rx + width - radius, ry + height);
                context.quadraticCurveTo(rx + width, ry + height, rx + width, ry + height - radius);
                context.lineTo(rx + width, ry + radius);
                context.quadraticCurveTo(rx + width, ry, rx + width - radius, ry);
                context.lineTo(rx + radius, ry);
                context.quadraticCurveTo(rx, ry, rx, ry + radius);
                context.closePath();
            }
        }
    };

    /**
     * Restores the current drawing context to the state it was before the mask was applied.
     *
     * @param {PIXI.CanvasRenderer} renderer - The renderer context to use.
     */


    CanvasMaskManager.prototype.popMask = function popMask(renderer) {
        renderer.context.restore();
        renderer.invalidateBlendMode();
    };

    /**
     * Destroys this canvas mask manager.
     *
     */


    CanvasMaskManager.prototype.destroy = function destroy() {
        /* empty */
    };

    return CanvasMaskManager;
}();

exports.default = CanvasMaskManager;
//# sourceMappingURL=CanvasMaskManager.js.map