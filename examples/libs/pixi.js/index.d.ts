/// <reference types="@pixi/ticker" />
/// <reference types="@pixi/core" />
/// <reference types="@pixi/display" />
/// <reference types="@pixi/loaders" />
/// <reference types="@pixi/mesh" />
/// <reference types="@pixi/mixin-get-child-by-name" />
/// <reference types="@pixi/mixin-get-global-position" />
/// <reference types="@pixi/sprite" />
/// <reference types="@pixi/graphics" />
/// <reference types="@pixi/mesh-extras" />
/// <reference types="@pixi/sprite-tiling" />
/// <reference types="@pixi/spritesheet" />
/// <reference types="@pixi/accessibility" />
/// <reference types="@pixi/app" />
/// <reference types="@pixi/mixin-cache-as-bitmap" />
/// <reference types="@pixi/interaction" />
/// <reference types="@pixi/text-bitmap" />

import { AlphaFilter } from '@pixi/filter-alpha';
import { BlurFilter } from '@pixi/filter-blur';
import { BlurFilterPass } from '@pixi/filter-blur';
import { ColorMatrixFilter } from '@pixi/filter-color-matrix';
import { DisplacementFilter } from '@pixi/filter-displacement';
import { FXAAFilter } from '@pixi/filter-fxaa';
import { NoiseFilter } from '@pixi/filter-noise';
import * as utils from '@pixi/utils';

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
export declare const filters: {
    AlphaFilter: typeof AlphaFilter;
    BlurFilter: typeof BlurFilter;
    BlurFilterPass: typeof BlurFilterPass;
    ColorMatrixFilter: typeof ColorMatrixFilter;
    DisplacementFilter: typeof DisplacementFilter;
    FXAAFilter: typeof FXAAFilter;
    NoiseFilter: typeof NoiseFilter;
};
export { utils }

/**
 * String of the current PIXI version.
 *
 * @static
 * @constant
 * @memberof PIXI
 * @name VERSION
 * @type {string}
 */
export declare const VERSION = "$_VERSION";

export * from "@pixi/accessibility";
export * from "@pixi/app";
export * from "@pixi/compressed-textures";
export * from "@pixi/constants";
export * from "@pixi/core";
export * from "@pixi/display";
export * from "@pixi/extract";
export * from "@pixi/graphics";
export * from "@pixi/interaction";
export * from "@pixi/loaders";
export * from "@pixi/math";
export * from "@pixi/mesh";
export * from "@pixi/mesh-extras";
export * from "@pixi/particles";
export * from "@pixi/prepare";
export * from "@pixi/runner";
export * from "@pixi/settings";
export * from "@pixi/sprite";
export * from "@pixi/sprite-animated";
export * from "@pixi/sprite-tiling";
export * from "@pixi/spritesheet";
export * from "@pixi/text";
export * from "@pixi/text-bitmap";
export * from "@pixi/ticker";

export { }
