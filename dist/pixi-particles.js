/*!
 * pixi-particles - v3.0.0
 * Compiled Mon, 12 Feb 2018 04:21:37 UTC
 *
 * pixi-particles is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.pixiParticles = f()}})(function(){var define,module,exports;return (function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(_dereq_,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Particle_1 = _dereq_("./Particle");
var Texture = PIXI.Texture;
/**
 * An individual particle image with an animation. Art data passed to the emitter must be
 * formatted in a particular way for AnimatedParticle to be able to handle it:
 *
 *     {
 *         //framerate is required. It is the animation speed of the particle in frames per
 *         //second.
 *         //A value of "matchLife" causes the animation to match the lifetime of an individual
 *         //particle, instead of at a constant framerate. This causes the animation to play
 *         //through one time, completing when the particle expires.
 *         framerate: 6,
 *         //loop is optional, and defaults to false.
 *         loop: true,
 *         //textures is required, and can be an array of any (non-zero) length.
 *         textures: [
 *             //each entry represents a single texture that should be used for one or more
 *             //frames. Any strings will be converted to Textures with Texture.fromImage().
 *             //Instances of PIXI.Texture will be used directly.
 *             "animFrame1.png",
 *             //entries can be an object with a 'count' property, telling AnimatedParticle to
 *             //use that texture for 'count' frames sequentially.
 *             {
 *                 texture: "animFrame2.png",
 *                 count: 3
 *             },
 *             "animFrame3.png"
 *         ]
 *     }
 *
 * @memberof PIXI.particles
 * @class AnimatedParticle
 * @extends PIXI.particles.Particle
 * @constructor
 * @param {PIXI.particles.Emitter} emitter The emitter that controls this AnimatedParticle.
 */
var AnimatedParticle = /** @class */ (function (_super) {
    __extends(AnimatedParticle, _super);
    function AnimatedParticle(emitter) {
        var _this = _super.call(this, emitter) || this;
        _this.textures = null;
        _this.duration = 0;
        _this.framerate = 0;
        _this.elapsed = 0;
        _this.loop = false;
        return _this;
    }
    /**
     * Initializes the particle for use, based on the properties that have to
     * have been set already on the particle.
     * @method PIXI.particles.AnimatedParticle#init
     */
    AnimatedParticle.prototype.init = function () {
        this.Particle_init();
        this.elapsed = 0;
        //if the animation needs to match the particle's life, then cacluate variables
        if (this.framerate < 0) {
            this.duration = this.maxLife;
            this.framerate = this.textures.length / this.duration;
        }
    };
    /**
     * Sets the textures for the particle.
     * @method PIXI.particles.AnimatedParticle#applyArt
     * @param {Array} art An array of PIXI.Texture objects for this animated particle.
     */
    AnimatedParticle.prototype.applyArt = function (art) {
        this.textures = art.textures;
        this.framerate = art.framerate;
        this.duration = art.duration;
        this.loop = art.loop;
    };
    /**
     * Updates the particle.
     * @method PIXI.particles.AnimatedParticle#update
     * @param {Number} delta Time elapsed since the previous frame, in __seconds__.
     */
    AnimatedParticle.prototype.update = function (delta) {
        var lerp = this.Particle_update(delta);
        //only animate the particle if it is still alive
        if (lerp >= 0) {
            this.elapsed += delta;
            if (this.elapsed > this.duration) {
                //loop elapsed back around
                if (this.loop)
                    this.elapsed = this.elapsed % this.duration;
                else
                    this.elapsed = this.duration - 0.000001;
            }
            var frame = (this.elapsed * this.framerate + 0.0000001) | 0;
            this.texture = this.textures[frame] || PIXI.Texture.EMPTY;
        }
        return lerp;
    };
    /**
     * Destroys the particle, removing references and preventing future use.
     * @method PIXI.particles.AnimatedParticle#destroy
     */
    AnimatedParticle.prototype.destroy = function () {
        this.Particle_destroy();
        this.textures = null;
    };
    /**
     * Checks over the art that was passed to the Emitter's init() function, to do any special
     * modifications to prepare it ahead of time.
     * @method PIXI.particles.AnimatedParticle.parseArt
     * @static
     * @param  {Array} art The array of art data, properly formatted for AnimatedParticle.
     * @return {Array} The art, after any needed modifications.
     */
    AnimatedParticle.parseArt = function (art) {
        var data, output, textures, tex, outTextures;
        var outArr = [];
        for (var i = 0; i < art.length; ++i) {
            data = art[i];
            outArr[i] = output = {};
            output.textures = outTextures = [];
            textures = data.textures;
            for (var j = 0; j < textures.length; ++j) {
                tex = textures[j];
                if (typeof tex == "string")
                    outTextures.push(Texture.fromImage(tex));
                else if (tex instanceof Texture)
                    outTextures.push(tex);
                else {
                    var dupe = tex.count || 1;
                    if (typeof tex.texture == "string")
                        tex = Texture.fromImage(tex.texture);
                    else
                        tex = tex.texture;
                    for (; dupe > 0; --dupe) {
                        outTextures.push(tex);
                    }
                }
            }
            //use these values to signify that the animation should match the particle life time.
            if (data.framerate == "matchLife") {
                //-1 means that it should be calculated
                output.framerate = -1;
                output.duration = 0;
                output.loop = false;
            }
            else {
                //determine if the animation should loop
                output.loop = !!data.loop;
                //get the framerate, default to 60
                output.framerate = data.framerate > 0 ? data.framerate : 60;
                //determine the duration
                output.duration = outTextures.length / output.framerate;
            }
        }
        return outArr;
    };
    return AnimatedParticle;
}(Particle_1.default));
exports.default = AnimatedParticle;

},{"./Particle":3}],2:[function(_dereq_,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ParticleUtils_1 = _dereq_("./ParticleUtils");
var Particle_1 = _dereq_("./Particle");
var PropertyNode_1 = _dereq_("./PropertyNode");
var ticker = PIXI.ticker.shared;
var helperPoint = new PIXI.Point();
/**
 * A particle emitter.
 * @memberof PIXI.particles
 * @class Emitter
 * @constructor
 * @param {PIXI.Container} particleParent The container to add the
 *                                                     particles to.
 * @param {Array|PIXI.Texture|String} [particleImages] A texture or array of textures to use
 *                                                     for the particles. Strings will be turned
 *                                                     into textures via Texture.fromImage().
 * @param {Object} [config] A configuration object containing settings for the emitter.
 * @param {Boolean} [config.emit=true] If config.emit is explicitly passed as false, the Emitter
 *                                     will start disabled.
 * @param {Boolean} [config.autoUpdate=false] If config.emit is explicitly passed as true, the Emitter
 *                                     will automatically call update via the PIXI shared ticker.
 */
var Emitter = /** @class */ (function () {
    function Emitter(particleParent, particleImages, config) {
        this._particleConstructor = Particle_1.default;
        //properties for individual particles
        this.particleImages = null;
        this.startAlpha = null;
        this.startSpeed = null;
        this.minimumSpeedMultiplier = 1;
        this.acceleration = null;
        this.maxSpeed = NaN;
        this.startScale = null;
        this.minimumScaleMultiplier = 1;
        this.startColor = null;
        this.minLifetime = 0;
        this.maxLifetime = 0;
        this.minStartRotation = 0;
        this.maxStartRotation = 0;
        this.noRotation = false;
        this.minRotationSpeed = 0;
        this.maxRotationSpeed = 0;
        this.particleBlendMode = 0;
        this.customEase = null;
        this.extraData = null;
        //properties for spawning particles
        this._frequency = 1;
        this.spawnChance = 1;
        this.maxParticles = 1000;
        this.emitterLifetime = -1;
        this.spawnPos = null;
        this.spawnType = null;
        this._spawnFunc = null;
        this.spawnRect = null;
        this.spawnCircle = null;
        this.particlesPerWave = 1;
        this.particleSpacing = 0;
        this.angleStart = 0;
        //emitter properties
        this.rotation = 0;
        this.ownerPos = null;
        this._prevEmitterPos = null;
        this._prevPosIsValid = false;
        this._posChanged = false;
        this._parent = null;
        this.addAtBack = false;
        this.particleCount = 0;
        this._emit = false;
        this._spawnTimer = 0;
        this._emitterLife = -1;
        this._activeParticlesFirst = null;
        this._activeParticlesLast = null;
        this._poolFirst = null;
        this._origConfig = null;
        this._origArt = null;
        this._autoUpdate = false;
        this._destroyWhenComplete = false;
        this._completeCallback = null;
        //set the initial parent
        this.parent = particleParent;
        if (particleImages && config)
            this.init(particleImages, config);
        //save often used functions on the instance instead of the prototype for better speed
        this.recycle = this.recycle;
        this.update = this.update;
        this.rotate = this.rotate;
        this.updateSpawnPos = this.updateSpawnPos;
        this.updateOwnerPos = this.updateOwnerPos;
    }
    Object.defineProperty(Emitter.prototype, "frequency", {
        /**
         * Time between particle spawns in seconds. If this value is not a number greater than 0,
         * it will be set to 1 (particle per second) to prevent infinite loops.
         * @member {Number} PIXI.particles.Emitter#frequency
         */
        get: function () { return this._frequency; },
        set: function (value) {
            //do some error checking to prevent infinite loops
            if (typeof value == "number" && value > 0)
                this._frequency = value;
            else
                this._frequency = 1;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Emitter.prototype, "particleConstructor", {
        /**
         * The constructor used to create new particles. The default is
         * the built in Particle class. Setting this will dump any active or
         * pooled particles, if the emitter has already been used.
         * @member {Function} PIXI.particles.Emitter#particleConstructor
         */
        get: function () { return this._particleConstructor; },
        set: function (value) {
            if (value != this._particleConstructor) {
                this._particleConstructor = value;
                //clean up existing particles
                this.cleanup();
                //scrap all the particles
                for (var particle = this._poolFirst; particle; particle = particle.next) {
                    particle.destroy();
                }
                this._poolFirst = null;
                //re-initialize the emitter so that the new constructor can do anything it needs to
                if (this._origConfig && this._origArt)
                    this.init(this._origArt, this._origConfig);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Emitter.prototype, "parent", {
        /**
        * The container to add particles to. Settings this will dump any active particles.
        * @member {PIXI.Container} PIXI.particles.Emitter#parent
        */
        get: function () { return this._parent; },
        set: function (value) {
            this.cleanup();
            this._parent = value;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Sets up the emitter based on the config settings.
     * @method PIXI.particles.Emitter#init
     * @param {Array|PIXI.Texture} art A texture or array of textures to use for the particles.
     * @param {Object} config A configuration object containing settings for the emitter.
     */
    Emitter.prototype.init = function (art, config) {
        if (!art || !config)
            return;
        //clean up any existing particles
        this.cleanup();
        //store the original config and particle images, in case we need to re-initialize
        //when the particle constructor is changed
        this._origConfig = config;
        this._origArt = art;
        //set up the array of data, also ensuring that it is an array
        art = Array.isArray(art) ? art.slice() : [art];
        //run the art through the particle class's parsing function
        var partClass = this._particleConstructor;
        this.particleImages = partClass.parseArt ? partClass.parseArt(art) : art;
        ///////////////////////////
        // Particle Properties   //
        ///////////////////////////
        //set up the alpha
        if (config.alpha) {
            this.startAlpha = PropertyNode_1.default.createList(config.alpha);
        }
        else
            this.startAlpha = new PropertyNode_1.default(1, 0);
        //set up the speed
        if (config.speed) {
            this.startSpeed = PropertyNode_1.default.createList(config.speed);
            this.minimumSpeedMultiplier = config.speed.minimumSpeedMultiplier || 1;
        }
        else {
            this.minimumSpeedMultiplier = 1;
            this.startSpeed = new PropertyNode_1.default(0, 0);
        }
        //set up acceleration
        var acceleration = config.acceleration;
        if (acceleration && (acceleration.x || acceleration.y)) {
            //make sure we disable speed interpolation
            this.startSpeed.next = null;
            this.acceleration = new PIXI.Point(acceleration.x, acceleration.y);
            this.maxSpeed = config.maxSpeed || NaN;
        }
        else
            this.acceleration = new PIXI.Point();
        //set up the scale
        if (config.scale) {
            this.startScale = PropertyNode_1.default.createList(config.scale);
            this.minimumScaleMultiplier = config.scale.minimumScaleMultiplier || 1;
        }
        else {
            this.startScale = new PropertyNode_1.default(1, 0);
            this.minimumScaleMultiplier = 1;
        }
        //set up the color
        if (config.color) {
            this.startColor = PropertyNode_1.default.createList(config.color);
        }
        else {
            this.startColor = new PropertyNode_1.default({ r: 0xFF, g: 0xFF, b: 0xFF }, 0);
        }
        //set up the start rotation
        if (config.startRotation) {
            this.minStartRotation = config.startRotation.min;
            this.maxStartRotation = config.startRotation.max;
        }
        else
            this.minStartRotation = this.maxStartRotation = 0;
        if (config.noRotation &&
            (this.minStartRotation || this.maxStartRotation)) {
            this.noRotation = !!config.noRotation;
        }
        else
            this.noRotation = false;
        //set up the rotation speed
        if (config.rotationSpeed) {
            this.minRotationSpeed = config.rotationSpeed.min;
            this.maxRotationSpeed = config.rotationSpeed.max;
        }
        else
            this.minRotationSpeed = this.maxRotationSpeed = 0;
        //set up the lifetime
        this.minLifetime = config.lifetime.min;
        this.maxLifetime = config.lifetime.max;
        //get the blend mode
        this.particleBlendMode = ParticleUtils_1.default.getBlendMode(config.blendMode);
        //use the custom ease if provided
        if (config.ease) {
            this.customEase = typeof config.ease == "function" ?
                config.ease :
                ParticleUtils_1.default.generateEase(config.ease);
        }
        else
            this.customEase = null;
        //set up the extra data, running it through the particle class's parseData function.
        if (partClass.parseData)
            this.extraData = partClass.parseData(config.extraData);
        else
            this.extraData = config.extraData || null;
        //////////////////////////
        // Emitter Properties   //
        //////////////////////////
        //reset spawn type specific settings
        this.spawnRect = this.spawnCircle = null;
        this.particlesPerWave = 1;
        if (config.particlesPerWave && config.particlesPerWave > 1)
            this.particlesPerWave = config.particlesPerWave;
        this.particleSpacing = 0;
        this.angleStart = 0;
        var spawnCircle;
        //determine the spawn function to use
        switch (config.spawnType) {
            case "rect":
                this.spawnType = "rect";
                this._spawnFunc = this._spawnRect;
                var spawnRect = config.spawnRect;
                this.spawnRect = new PIXI.Rectangle(spawnRect.x, spawnRect.y, spawnRect.w, spawnRect.h);
                break;
            case "circle":
                this.spawnType = "circle";
                this._spawnFunc = this._spawnCircle;
                spawnCircle = config.spawnCircle;
                this.spawnCircle = new PIXI.Circle(spawnCircle.x, spawnCircle.y, spawnCircle.r);
                break;
            case "ring":
                this.spawnType = "ring";
                this._spawnFunc = this._spawnRing;
                spawnCircle = config.spawnCircle;
                this.spawnCircle = new PIXI.Circle(spawnCircle.x, spawnCircle.y, spawnCircle.r);
                this.spawnCircle.minRadius = spawnCircle.minR;
                break;
            case "burst":
                this.spawnType = "burst";
                this._spawnFunc = this._spawnBurst;
                this.particleSpacing = config.particleSpacing;
                this.angleStart = config.angleStart ? config.angleStart : 0;
                break;
            case "point":
                this.spawnType = "point";
                this._spawnFunc = this._spawnPoint;
                break;
            default:
                this.spawnType = "point";
                this._spawnFunc = this._spawnPoint;
                break;
        }
        //set the spawning frequency
        this.frequency = config.frequency;
        this.spawnChance = (typeof config.spawnChance === 'number' && config.spawnChance > 0) ? config.spawnChance : 1;
        //set the emitter lifetime
        this.emitterLifetime = config.emitterLifetime || -1;
        //set the max particles
        this.maxParticles = config.maxParticles > 0 ? config.maxParticles : 1000;
        //determine if we should add the particle at the back of the list or not
        this.addAtBack = !!config.addAtBack;
        //reset the emitter position and rotation variables
        this.rotation = 0;
        this.ownerPos = new PIXI.Point();
        this.spawnPos = new PIXI.Point(config.pos.x, config.pos.y);
        this._prevEmitterPos = this.spawnPos.clone();
        //previous emitter position is invalid and should not be used for interpolation
        this._prevPosIsValid = false;
        //start emitting
        this._spawnTimer = 0;
        this.emit = config.emit === undefined ? true : !!config.emit;
        this.autoUpdate = config.autoUpdate === undefined ? false : !!config.autoUpdate;
    };
    /**
     * Recycles an individual particle.
     * @method PIXI.particles.Emitter#recycle
     * @param {Particle} particle The particle to recycle.
     * @private
     */
    Emitter.prototype.recycle = function (particle) {
        if (particle.next)
            particle.next.prev = particle.prev;
        if (particle.prev)
            particle.prev.next = particle.next;
        if (particle == this._activeParticlesLast)
            this._activeParticlesLast = particle.prev;
        if (particle == this._activeParticlesFirst)
            this._activeParticlesFirst = particle.next;
        //add to pool
        particle.prev = null;
        particle.next = this._poolFirst;
        this._poolFirst = particle;
        //remove child from display, or make it invisible if it is in a ParticleContainer
        if (particle.parent)
            particle.parent.removeChild(particle);
        //decrease count
        --this.particleCount;
    };
    /**
     * Sets the rotation of the emitter to a new value.
     * @method PIXI.particles.Emitter#rotate
     * @param {Number} newRot The new rotation, in degrees.
     */
    Emitter.prototype.rotate = function (newRot) {
        if (this.rotation == newRot)
            return;
        //caclulate the difference in rotation for rotating spawnPos
        var diff = newRot - this.rotation;
        this.rotation = newRot;
        //rotate spawnPos
        ParticleUtils_1.default.rotatePoint(diff, this.spawnPos);
        //mark the position as having changed
        this._posChanged = true;
    };
    /**
     * Changes the spawn position of the emitter.
     * @method PIXI.particles.Emitter#updateSpawnPos
     * @param {Number} x The new x value of the spawn position for the emitter.
     * @param {Number} y The new y value of the spawn position for the emitter.
     */
    Emitter.prototype.updateSpawnPos = function (x, y) {
        this._posChanged = true;
        this.spawnPos.x = x;
        this.spawnPos.y = y;
    };
    /**
     * Changes the position of the emitter's owner. You should call this if you are adding
     * particles to the world container that your emitter's owner is moving around in.
     * @method PIXI.particles.Emitter#updateOwnerPos
     * @param {Number} x The new x value of the emitter's owner.
     * @param {Number} y The new y value of the emitter's owner.
     */
    Emitter.prototype.updateOwnerPos = function (x, y) {
        this._posChanged = true;
        this.ownerPos.x = x;
        this.ownerPos.y = y;
    };
    /**
     * Prevents emitter position interpolation in the next update.
     * This should be used if you made a major position change of your emitter's owner
     * that was not normal movement.
     * @method PIXI.particles.Emitter#resetPositionTracking
     */
    Emitter.prototype.resetPositionTracking = function () {
        this._prevPosIsValid = false;
    };
    Object.defineProperty(Emitter.prototype, "emit", {
        /**
         * If particles should be emitted during update() calls. Setting this to false
         * stops new particles from being created, but allows existing ones to die out.
         * @member {Boolean} PIXI.particles.Emitter#emit
         */
        get: function () { return this._emit; },
        set: function (value) {
            this._emit = !!value;
            this._emitterLife = this.emitterLifetime;
        },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(Emitter.prototype, "autoUpdate", {
        /**
         * If the update function is called automatically from the shared ticker.
         * Setting this to false requires calling the update function manually.
         * @member {Boolean} PIXI.particles.Emitter#autoUpdate
         */
        get: function () { return this._autoUpdate; },
        set: function (value) {
            if (this._autoUpdate && !value) {
                ticker.remove(this.update, this);
            }
            else if (!this._autoUpdate && value) {
                ticker.add(this.update, this);
            }
            this._autoUpdate = !!value;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Starts emitting particles, sets autoUpdate to true, and sets up the Emitter to destroy itself
     * when particle emission is complete.
     * @method PIXI.particles.Emitter#playOnceAndDestroy
     * @param {Function} [callback] Callback for when emission is complete (all particles have died off)
     */
    Emitter.prototype.playOnceAndDestroy = function (callback) {
        this.autoUpdate = true;
        this.emit = true;
        this._destroyWhenComplete = true;
        this._completeCallback = callback;
    };
    /**
     * Starts emitting particles and optionally calls a callback when particle emission is complete.
     * @method PIXI.particles.Emitter#playOnce
     * @param {Function} [callback] Callback for when emission is complete (all particles have died off)
     */
    Emitter.prototype.playOnce = function (callback) {
        this.emit = true;
        this._completeCallback = callback;
    };
    /**
     * Updates all particles spawned by this emitter and emits new ones.
     * @method PIXI.particles.Emitter#update
     * @param {Number} delta Time elapsed since the previous frame, in __seconds__.
     */
    Emitter.prototype.update = function (delta) {
        if (this._autoUpdate) {
            delta = delta / PIXI.settings.TARGET_FPMS / 1000;
        }
        //if we don't have a parent to add particles to, then don't do anything.
        //this also works as a isDestroyed check
        if (!this._parent)
            return;
        //update existing particles
        var i, particle, next;
        for (particle = this._activeParticlesFirst; particle; particle = next) {
            next = particle.next;
            particle.update(delta);
        }
        var prevX, prevY;
        //if the previous position is valid, store these for later interpolation
        if (this._prevPosIsValid) {
            prevX = this._prevEmitterPos.x;
            prevY = this._prevEmitterPos.y;
        }
        //store current position of the emitter as local variables
        var curX = this.ownerPos.x + this.spawnPos.x;
        var curY = this.ownerPos.y + this.spawnPos.y;
        //spawn new particles
        if (this._emit) {
            //decrease spawn timer
            this._spawnTimer -= delta;
            //while _spawnTimer < 0, we have particles to spawn
            while (this._spawnTimer <= 0) {
                //determine if the emitter should stop spawning
                if (this._emitterLife > 0) {
                    this._emitterLife -= this._frequency;
                    if (this._emitterLife <= 0) {
                        this._spawnTimer = 0;
                        this._emitterLife = 0;
                        this.emit = false;
                        break;
                    }
                }
                //determine if we have hit the particle limit
                if (this.particleCount >= this.maxParticles) {
                    this._spawnTimer += this._frequency;
                    continue;
                }
                //determine the particle lifetime
                var lifetime = void 0;
                if (this.minLifetime == this.maxLifetime)
                    lifetime = this.minLifetime;
                else
                    lifetime = Math.random() * (this.maxLifetime - this.minLifetime) + this.minLifetime;
                //only make the particle if it wouldn't immediately destroy itself
                if (-this._spawnTimer < lifetime) {
                    //If the position has changed and this isn't the first spawn,
                    //interpolate the spawn position
                    var emitPosX = void 0, emitPosY = void 0;
                    if (this._prevPosIsValid && this._posChanged) {
                        //1 - _spawnTimer / delta, but _spawnTimer is negative
                        var lerp = 1 + this._spawnTimer / delta;
                        emitPosX = (curX - prevX) * lerp + prevX;
                        emitPosY = (curY - prevY) * lerp + prevY;
                    }
                    else {
                        emitPosX = curX;
                        emitPosY = curY;
                    }
                    //create enough particles to fill the wave (non-burst types have a wave of 1)
                    i = 0;
                    for (var len = Math.min(this.particlesPerWave, this.maxParticles - this.particleCount); i < len; ++i) {
                        //see if we actually spawn one
                        if (this.spawnChance < 1 && Math.random() >= this.spawnChance)
                            continue;
                        //create particle
                        var p = void 0;
                        if (this._poolFirst) {
                            p = this._poolFirst;
                            this._poolFirst = this._poolFirst.next;
                            p.next = null;
                        }
                        else {
                            p = new this.particleConstructor(this);
                        }
                        //set a random texture if we have more than one
                        if (this.particleImages.length > 1) {
                            p.applyArt(this.particleImages[Math.floor(Math.random() * this.particleImages.length)]);
                        }
                        else {
                            //if they are actually the same texture, a standard particle
                            //will quit early from the texture setting in setTexture().
                            p.applyArt(this.particleImages[0]);
                        }
                        //set up the start and end values
                        p.alphaList.reset(this.startAlpha);
                        if (this.minimumSpeedMultiplier != 1) {
                            p.speedMultiplier = Math.random() * (1 - this.minimumSpeedMultiplier) + this.minimumSpeedMultiplier;
                        }
                        p.speedList.reset(this.startSpeed);
                        p.acceleration.x = this.acceleration.x;
                        p.acceleration.y = this.acceleration.y;
                        p.maxSpeed = this.maxSpeed;
                        if (this.minimumScaleMultiplier != 1) {
                            p.scaleMultiplier = Math.random() * (1 - this.minimumScaleMultiplier) + this.minimumScaleMultiplier;
                        }
                        p.scaleList.reset(this.startScale);
                        p.colorList.reset(this.startColor);
                        //randomize the rotation speed
                        if (this.minRotationSpeed == this.maxRotationSpeed)
                            p.rotationSpeed = this.minRotationSpeed;
                        else
                            p.rotationSpeed = Math.random() * (this.maxRotationSpeed - this.minRotationSpeed) + this.minRotationSpeed;
                        p.noRotation = this.noRotation;
                        //set up the lifetime
                        p.maxLife = lifetime;
                        //set the blend mode
                        p.blendMode = this.particleBlendMode;
                        //set the custom ease, if any
                        p.ease = this.customEase;
                        //set the extra data, if any
                        p.extraData = this.extraData;
                        //call the proper function to handle rotation and position of particle
                        this._spawnFunc(p, emitPosX, emitPosY, i);
                        //initialize particle
                        p.init();
                        //update the particle by the time passed, so the particles are spread out properly
                        p.update(-this._spawnTimer); //we want a positive delta, because a negative delta messes things up
                        //add the particle to the display list
                        if (!p.parent) {
                            if (this.addAtBack)
                                this._parent.addChildAt(p, 0);
                            else
                                this._parent.addChild(p);
                        }
                        else {
                            //kind of hacky, but performance friendly
                            //shuffle children to correct place
                            var children = this._parent.children;
                            //avoid using splice if possible
                            if (children[0] == p)
                                children.shift();
                            else if (children[children.length - 1] == p)
                                children.pop();
                            else {
                                var index = children.indexOf(p);
                                children.splice(index, 1);
                            }
                            if (this.addAtBack)
                                children.unshift(p);
                            else
                                children.push(p);
                        }
                        //add particle to list of active particles
                        if (this._activeParticlesLast) {
                            this._activeParticlesLast.next = p;
                            p.prev = this._activeParticlesLast;
                            this._activeParticlesLast = p;
                        }
                        else {
                            this._activeParticlesLast = this._activeParticlesFirst = p;
                        }
                        ++this.particleCount;
                    }
                }
                //increase timer and continue on to any other particles that need to be created
                this._spawnTimer += this._frequency;
            }
        }
        //if the position changed before this update, then keep track of that
        if (this._posChanged) {
            this._prevEmitterPos.x = curX;
            this._prevEmitterPos.y = curY;
            this._prevPosIsValid = true;
            this._posChanged = false;
        }
        //if we are all done and should destroy ourselves, take care of that
        if (!this._emit && !this._activeParticlesFirst) {
            if (this._completeCallback) {
                this._completeCallback();
            }
            if (this._destroyWhenComplete) {
                this.destroy();
            }
        }
    };
    /**
     * Positions a particle for a point type emitter.
     * @method PIXI.particles.Emitter#_spawnPoint
     * @private
     * @param {Particle} p The particle to position and rotate.
     * @param {Number} emitPosX The emitter's x position
     * @param {Number} emitPosY The emitter's y position
     * @param {int} i The particle number in the current wave. Not used for this function.
     */
    Emitter.prototype._spawnPoint = function (p, emitPosX, emitPosY) {
        //set the initial rotation/direction of the particle based on
        //starting particle angle and rotation of emitter
        if (this.minStartRotation == this.maxStartRotation)
            p.rotation = this.minStartRotation + this.rotation;
        else
            p.rotation = Math.random() * (this.maxStartRotation - this.minStartRotation) + this.minStartRotation + this.rotation;
        //drop the particle at the emitter's position
        p.position.x = emitPosX;
        p.position.y = emitPosY;
    };
    /**
     * Positions a particle for a rectangle type emitter.
     * @method PIXI.particles.Emitter#_spawnRect
     * @private
     * @param {Particle} p The particle to position and rotate.
     * @param {Number} emitPosX The emitter's x position
     * @param {Number} emitPosY The emitter's y position
     * @param {int} i The particle number in the current wave. Not used for this function.
     */
    Emitter.prototype._spawnRect = function (p, emitPosX, emitPosY) {
        //set the initial rotation/direction of the particle based on starting
        //particle angle and rotation of emitter
        if (this.minStartRotation == this.maxStartRotation)
            p.rotation = this.minStartRotation + this.rotation;
        else
            p.rotation = Math.random() * (this.maxStartRotation - this.minStartRotation) + this.minStartRotation + this.rotation;
        //place the particle at a random point in the rectangle
        helperPoint.x = Math.random() * this.spawnRect.width + this.spawnRect.x;
        helperPoint.y = Math.random() * this.spawnRect.height + this.spawnRect.y;
        if (this.rotation !== 0)
            ParticleUtils_1.default.rotatePoint(this.rotation, helperPoint);
        p.position.x = emitPosX + helperPoint.x;
        p.position.y = emitPosY + helperPoint.y;
    };
    /**
     * Positions a particle for a circle type emitter.
     * @method PIXI.particles.Emitter#_spawnCircle
     * @private
     * @param {Particle} p The particle to position and rotate.
     * @param {Number} emitPosX The emitter's x position
     * @param {Number} emitPosY The emitter's y position
     * @param {int} i The particle number in the current wave. Not used for this function.
     */
    Emitter.prototype._spawnCircle = function (p, emitPosX, emitPosY) {
        //set the initial rotation/direction of the particle based on starting
        //particle angle and rotation of emitter
        if (this.minStartRotation == this.maxStartRotation)
            p.rotation = this.minStartRotation + this.rotation;
        else
            p.rotation = Math.random() * (this.maxStartRotation - this.minStartRotation) +
                this.minStartRotation + this.rotation;
        //place the particle at a random radius in the circle
        helperPoint.x = Math.random() * this.spawnCircle.radius;
        helperPoint.y = 0;
        //rotate the point to a random angle in the circle
        ParticleUtils_1.default.rotatePoint(Math.random() * 360, helperPoint);
        //offset by the circle's center
        helperPoint.x += this.spawnCircle.x;
        helperPoint.y += this.spawnCircle.y;
        //rotate the point by the emitter's rotation
        if (this.rotation !== 0)
            ParticleUtils_1.default.rotatePoint(this.rotation, helperPoint);
        //set the position, offset by the emitter's position
        p.position.x = emitPosX + helperPoint.x;
        p.position.y = emitPosY + helperPoint.y;
    };
    /**
     * Positions a particle for a ring type emitter.
     * @method PIXI.particles.Emitter#_spawnRing
     * @private
     * @param {Particle} p The particle to position and rotate.
     * @param {Number} emitPosX The emitter's x position
     * @param {Number} emitPosY The emitter's y position
     * @param {int} i The particle number in the current wave. Not used for this function.
     */
    Emitter.prototype._spawnRing = function (p, emitPosX, emitPosY) {
        var spawnCircle = this.spawnCircle;
        //set the initial rotation/direction of the particle based on starting
        //particle angle and rotation of emitter
        if (this.minStartRotation == this.maxStartRotation)
            p.rotation = this.minStartRotation + this.rotation;
        else
            p.rotation = Math.random() * (this.maxStartRotation - this.minStartRotation) +
                this.minStartRotation + this.rotation;
        //place the particle at a random radius in the ring
        if (spawnCircle.minRadius == spawnCircle.radius) {
            helperPoint.x = Math.random() * (spawnCircle.radius - spawnCircle.minRadius) +
                spawnCircle.minRadius;
        }
        else
            helperPoint.x = spawnCircle.radius;
        helperPoint.y = 0;
        //rotate the point to a random angle in the circle
        var angle = Math.random() * 360;
        p.rotation += angle;
        ParticleUtils_1.default.rotatePoint(angle, helperPoint);
        //offset by the circle's center
        helperPoint.x += this.spawnCircle.x;
        helperPoint.y += this.spawnCircle.y;
        //rotate the point by the emitter's rotation
        if (this.rotation !== 0)
            ParticleUtils_1.default.rotatePoint(this.rotation, helperPoint);
        //set the position, offset by the emitter's position
        p.position.x = emitPosX + helperPoint.x;
        p.position.y = emitPosY + helperPoint.y;
    };
    /**
     * Positions a particle for a burst type emitter.
     * @method PIXI.particles.Emitter#_spawnBurst
     * @private
     * @param {Particle} p The particle to position and rotate.
     * @param {Number} emitPosX The emitter's x position
     * @param {Number} emitPosY The emitter's y position
     * @param {int} i The particle number in the current wave.
     */
    Emitter.prototype._spawnBurst = function (p, emitPosX, emitPosY, i) {
        //set the initial rotation/direction of the particle based on spawn
        //angle and rotation of emitter
        if (this.particleSpacing === 0)
            p.rotation = Math.random() * 360;
        else
            p.rotation = this.angleStart + (this.particleSpacing * i) + this.rotation;
        //drop the particle at the emitter's position
        p.position.x = emitPosX;
        p.position.y = emitPosY;
    };
    /**
     * Kills all active particles immediately.
     * @method PIXI.particles.Emitter#cleanup
     */
    Emitter.prototype.cleanup = function () {
        var particle, next;
        for (particle = this._activeParticlesFirst; particle; particle = next) {
            next = particle.next;
            this.recycle(particle);
            if (particle.parent)
                particle.parent.removeChild(particle);
        }
        this._activeParticlesFirst = this._activeParticlesLast = null;
        this.particleCount = 0;
    };
    /**
     * Destroys the emitter and all of its particles.
     * @method PIXI.particles.Emitter#destroy
     */
    Emitter.prototype.destroy = function () {
        //make sure we aren't still listening to any tickers
        this.autoUpdate = false;
        //puts all active particles in the pool, and removes them from the particle parent
        this.cleanup();
        //wipe the pool clean
        var next;
        for (var particle = this._poolFirst; particle; particle = next) {
            //store next value so we don't lose it in our destroy call
            next = particle.next;
            particle.destroy();
        }
        this._poolFirst = this._parent = this.particleImages = this.spawnPos = this.ownerPos =
            this.startColor = this.startScale = this.startAlpha = this.startSpeed =
                this.customEase = this._completeCallback = null;
    };
    return Emitter;
}());
exports.default = Emitter;

},{"./Particle":3,"./ParticleUtils":4,"./PropertyNode":7}],3:[function(_dereq_,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var ParticleUtils_1 = _dereq_("./ParticleUtils");
var PropertyList_1 = _dereq_("./PropertyList");
var Sprite = PIXI.Sprite;
/**
 * An individual particle image. You shouldn't have to deal with these.
 * @memberof PIXI.particles
 * @class Particle
 * @extends PIXI.Sprite
 * @constructor
 * @param {PIXI.particles.Emitter} emitter The emitter that controls this particle.
 */
var Particle = /** @class */ (function (_super) {
    __extends(Particle, _super);
    function Particle(emitter) {
        var _this = 
        //start off the sprite with a blank texture, since we are going to replace it
        //later when the particle is initialized.
        _super.call(this) || this;
        _this.emitter = emitter;
        //particles should be centered
        _this.anchor.x = _this.anchor.y = 0.5;
        _this.velocity = new PIXI.Point();
        _this.maxLife = 0;
        _this.age = 0;
        _this.ease = null;
        _this.extraData = null;
        _this.alphaList = new PropertyList_1.default();
        _this.speedList = new PropertyList_1.default();
        _this.speedMultiplier = 1;
        /**
         * Acceleration to apply to the particle.
         * @property {PIXI.Point} accleration
         */
        _this.acceleration = new PIXI.Point();
        /**
         * The maximum speed allowed for accelerating particles. Negative values, values of 0 or NaN
         * will disable the maximum speed.
         * @property {Number} maxSpeed
         * @default NaN
         */
        _this.maxSpeed = NaN;
        /**
         * The scale of the particle throughout its life.
         * @property {PIXI.particles.PropertyList} scaleList
         */
        _this.scaleList = new PropertyList_1.default();
        /**
         * A multiplier from 0-1 applied to the scale of the particle at all times.
         * @property {number} scaleMultiplier
         */
        _this.scaleMultiplier = 1;
        /**
         * The tint of the particle throughout its life.
         * @property {PIXI.particles.PropertyList} colorList
         */
        _this.colorList = new PropertyList_1.default(true);
        /**
         * If alpha should be interpolated at all.
         * @property {Boolean} _doAlpha
         * @private
         */
        _this._doAlpha = false;
        /**
         * If scale should be interpolated at all.
         * @property {Boolean} _doScale
         * @private
         */
        _this._doScale = false;
        /**
         * If speed should be interpolated at all.
         * @property {Boolean} _doSpeed
         * @private
         */
        _this._doSpeed = false;
        /**
         * If acceleration should be handled at all. _doSpeed is mutually exclusive with this,
         * and _doSpeed gets priority.
         * @property {Boolean} _doAcceleration
         * @private
         */
        _this._doAcceleration = false;
        /**
         * If color should be interpolated at all.
         * @property {Boolean} _doColor
         * @private
         */
        _this._doColor = false;
        /**
         * If normal movement should be handled. Subclasses wishing to override movement
         * can set this to false in init().
         * @property {Boolean} _doNormalMovement
         * @private
         */
        _this._doNormalMovement = false;
        /**
         * One divided by the max life of the particle, saved for slightly faster math.
         * @property {Number} _oneOverLife
         * @private
         */
        _this._oneOverLife = 0;
        /**
         * Reference to the next particle in the list.
         * @property {Particle} next
         * @private
         */
        _this.next = null;
        /**
         * Reference to the previous particle in the list.
         * @property {Particle} prev
         * @private
         */
        _this.prev = null;
        //save often used functions on the instance instead of the prototype for better speed
        _this.init = _this.init;
        _this.Particle_init = Particle.prototype.init;
        _this.update = _this.update;
        _this.Particle_update = Particle.prototype.update;
        _this.Sprite_destroy = _super.prototype.destroy;
        _this.Particle_destroy = Particle.prototype.destroy;
        _this.applyArt = _this.applyArt;
        _this.kill = _this.kill;
        return _this;
    }
    /**
     * Initializes the particle for use, based on the properties that have to
     * have been set already on the particle.
     * @method PIXI.particles.Particle#init
     */
    Particle.prototype.init = function () {
        //reset the age
        this.age = 0;
        //set up the velocity based on the start speed and rotation
        this.velocity.x = this.speedList.current.value * this.speedMultiplier;
        this.velocity.y = 0;
        ParticleUtils_1.default.rotatePoint(this.rotation, this.velocity);
        if (this.noRotation) {
            this.rotation = 0;
        }
        else {
            //convert rotation to Radians from Degrees
            this.rotation *= ParticleUtils_1.default.DEG_TO_RADS;
        }
        //convert rotation speed to Radians from Degrees
        this.rotationSpeed *= ParticleUtils_1.default.DEG_TO_RADS;
        //set alpha to inital alpha
        this.alpha = this.alphaList.current.value;
        //set scale to initial scale
        this.scale.x = this.scale.y = this.scaleList.current.value;
        //figure out what we need to interpolate
        this._doAlpha = !!this.alphaList.current.next;
        this._doSpeed = !!this.speedList.current.next;
        this._doScale = !!this.scaleList.current.next;
        this._doColor = !!this.colorList.current.next;
        this._doAcceleration = this.acceleration.x !== 0 || this.acceleration.y !== 0;
        //_doNormalMovement can be cancelled by subclasses
        this._doNormalMovement = this._doSpeed || this.speedList.current.value !== 0 || this._doAcceleration;
        //save our lerp helper
        this._oneOverLife = 1 / this.maxLife;
        //set the inital color
        var color = this.colorList.current.value;
        this.tint = ParticleUtils_1.default.combineRGBComponents(color.r, color.g, color.b);
        //ensure visibility
        this.visible = true;
    };
    /**
     * Sets the texture for the particle. This can be overridden to allow
     * for an animated particle.
     * @method PIXI.particles.Particle#applyArt
     * @param {PIXI.Texture} art The texture to set.
     */
    Particle.prototype.applyArt = function (art) {
        this.texture = art || PIXI.Texture.EMPTY;
    };
    /**
     * Updates the particle.
     * @method PIXI.particles.Particle#update
     * @param {Number} delta Time elapsed since the previous frame, in __seconds__.
     * @return {Number} The standard interpolation multiplier (0-1) used for all relevant particle
     *                   properties. A value of -1 means the particle died of old age instead.
     */
    Particle.prototype.update = function (delta) {
        //increase age
        this.age += delta;
        //recycle particle if it is too old
        if (this.age >= this.maxLife) {
            this.kill();
            return -1;
        }
        //determine our interpolation value
        var lerp = this.age * this._oneOverLife; //lifetime / maxLife;
        if (this.ease) {
            if (this.ease.length == 4) {
                //the t, b, c, d parameters that some tween libraries use
                //(time, initial value, end value, duration)
                lerp = this.ease(lerp, 0, 1, 1);
            }
            else {
                //the simplified version that we like that takes
                //one parameter, time from 0-1. TweenJS eases provide this usage.
                lerp = this.ease(lerp);
            }
        }
        //interpolate alpha
        if (this._doAlpha)
            this.alpha = this.alphaList.interpolate(lerp);
        //interpolate scale
        if (this._doScale) {
            var scale = this.scaleList.interpolate(lerp) * this.scaleMultiplier;
            this.scale.x = this.scale.y = scale;
        }
        //handle movement
        if (this._doNormalMovement) {
            //interpolate speed
            if (this._doSpeed) {
                var speed = this.speedList.interpolate(lerp) * this.speedMultiplier;
                ParticleUtils_1.default.normalize(this.velocity);
                ParticleUtils_1.default.scaleBy(this.velocity, speed);
            }
            else if (this._doAcceleration) {
                this.velocity.x += this.acceleration.x * delta;
                this.velocity.y += this.acceleration.y * delta;
                if (this.maxSpeed) {
                    var currentSpeed = ParticleUtils_1.default.length(this.velocity);
                    //if we are going faster than we should, clamp at the max speed
                    //DO NOT recalculate vector length
                    if (currentSpeed > this.maxSpeed) {
                        ParticleUtils_1.default.scaleBy(this.velocity, this.maxSpeed / currentSpeed);
                    }
                }
            }
            //adjust position based on velocity
            this.position.x += this.velocity.x * delta;
            this.position.y += this.velocity.y * delta;
        }
        //interpolate color
        if (this._doColor) {
            this.tint = this.colorList.interpolate(lerp);
        }
        //update rotation
        if (this.rotationSpeed !== 0) {
            this.rotation += this.rotationSpeed * delta;
        }
        else if (this.acceleration && !this.noRotation) {
            this.rotation = Math.atan2(this.velocity.y, this.velocity.x); // + Math.PI / 2;
        }
        return lerp;
    };
    /**
     * Kills the particle, removing it from the display list
     * and telling the emitter to recycle it.
     * @method PIXI.particles.Particle#kill
     */
    Particle.prototype.kill = function () {
        this.emitter.recycle(this);
    };
    /**
     * Destroys the particle, removing references and preventing future use.
     * @method PIXI.particles.Particle#destroy
     */
    Particle.prototype.destroy = function () {
        if (this.parent)
            this.parent.removeChild(this);
        this.Sprite_destroy();
        this.emitter = this.velocity = this.colorList = this.scaleList = this.alphaList =
            this.speedList = this.ease = this.next = this.prev = null;
    };
    /**
     * Checks over the art that was passed to the Emitter's init() function, to do any special
     * modifications to prepare it ahead of time.
     * @method PIXI.particles.Particle.parseArt
     * @static
     * @param  {Array} art The array of art data. For Particle, it should be an array of Textures.
     *                     Any strings in the array will be converted to Textures via
     *                     Texture.fromImage().
     * @return {Array} The art, after any needed modifications.
     */
    Particle.parseArt = function (art) {
        //convert any strings to Textures.
        var i;
        for (i = art.length; i >= 0; --i) {
            if (typeof art[i] == "string")
                art[i] = PIXI.Texture.fromImage(art[i]);
        }
        //particles from different base textures will be slower in WebGL than if they
        //were from one spritesheet
        if (ParticleUtils_1.default.verbose) {
            for (i = art.length - 1; i > 0; --i) {
                if (art[i].baseTexture != art[i - 1].baseTexture) {
                    if (window.console)
                        console.warn("PixiParticles: using particle textures from different images may hinder performance in WebGL");
                    break;
                }
            }
        }
        return art;
    };
    /**
     * Parses extra emitter data to ensure it is set up for this particle class.
     * Particle does nothing to the extra data.
     * @method PIXI.particles.Particle.parseData
     * @static
     * @param  {Object} extraData The extra data from the particle config.
     * @return {Object} The parsed extra data.
     */
    Particle.parseData = function (extraData) {
        return extraData;
    };
    return Particle;
}(Sprite));
exports.default = Particle;

},{"./ParticleUtils":4,"./PropertyList":6}],4:[function(_dereq_,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BLEND_MODES = PIXI.BLEND_MODES;
var PropertyNode_1 = _dereq_("./PropertyNode");
/**
 * Contains helper functions for particles and emitters to use.
 * @memberof PIXI.particles
 * @class ParticleUtils
 * @static
 */
var ParticleUtils = {
    /**
     * If errors and warnings should be logged within the library.
     * @name PIXI.particles.ParticleUtils.verbose
     * @default false
     * @static
     */
    verbose: false,
    DEG_TO_RADS: Math.PI / 180,
    /**
     * Rotates a point by a given angle.
     * @method PIXI.particles.ParticleUtils.rotatePoint
     * @param {Number} angle The angle to rotate by in degrees
     * @param {PIXI.Point} p The point to rotate around 0,0.
     * @static
     */
    rotatePoint: function (angle, p) {
        if (!angle)
            return;
        angle *= ParticleUtils.DEG_TO_RADS;
        var s = Math.sin(angle);
        var c = Math.cos(angle);
        var xnew = p.x * c - p.y * s;
        var ynew = p.x * s + p.y * c;
        p.x = xnew;
        p.y = ynew;
    },
    /**
     * Combines separate color components (0-255) into a single uint color.
     * @method PIXI.particles.ParticleUtils.combineRGBComponents
     * @param {uint} r The red value of the color
     * @param {uint} g The green value of the color
     * @param {uint} b The blue value of the color
     * @return {uint} The color in the form of 0xRRGGBB
     * @static
     */
    combineRGBComponents: function (r, g, b /*, a*/) {
        return /*a << 24 |*/ r << 16 | g << 8 | b;
    },
    /**
     * Reduces the point to a length of 1.
     * @method PIXI.particles.ParticleUtils.normalize
     * @static
     * @param {PIXI.Point} point The point to normalize
     */
    normalize: function (point) {
        var oneOverLen = 1 / ParticleUtils.length(point);
        point.x *= oneOverLen;
        point.y *= oneOverLen;
    },
    /**
     * Multiplies the x and y values of this point by a value.
     * @method PIXI.particles.ParticleUtils.scaleBy
     * @static
     * @param {PIXI.Point} point The point to scaleBy
     * @param {number} value The value to scale by.
     */
    scaleBy: function (point, value) {
        point.x *= value;
        point.y *= value;
    },
    /**
     * Returns the length (or magnitude) of this point.
     * @method PIXI.particles.ParticleUtils.length
     * @static
     * @param {PIXI.Point} point The point to measure length
     * @return The length of this point.
     */
    length: function (point) {
        return Math.sqrt(point.x * point.x + point.y * point.y);
    },
    /**
     * Converts a hex string from "#AARRGGBB", "#RRGGBB", "0xAARRGGBB", "0xRRGGBB",
     * "AARRGGBB", or "RRGGBB" to an object of ints of 0-255, as
     * {r, g, b, (a)}.
     * @method PIXI.particles.ParticleUtils.hexToRGB
     * @param {string} color The input color string.
     * @param {Object} [output] An object to put the output in. If omitted, a new object is created.
     * @return The object with r, g, and b properties, possibly with an a property.
     * @static
     */
    hexToRGB: function (color, output) {
        if (!output)
            output = {};
        if (color.charAt(0) == "#")
            color = color.substr(1);
        else if (color.indexOf("0x") === 0)
            color = color.substr(2);
        var alpha;
        if (color.length == 8) {
            alpha = color.substr(0, 2);
            color = color.substr(2);
        }
        output.r = parseInt(color.substr(0, 2), 16); //Red
        output.g = parseInt(color.substr(2, 2), 16); //Green
        output.b = parseInt(color.substr(4, 2), 16); //Blue
        if (alpha)
            output.a = parseInt(alpha, 16);
        return output;
    },
    /**
     * Generates a custom ease function, based on the GreenSock custom ease, as demonstrated
     * by the related tool at http://www.greensock.com/customease/.
     * @method PIXI.particles.ParticleUtils.generateEase
     * @param {Array} segments An array of segments, as created by
     * http://www.greensock.com/customease/.
     * @return {Function} A function that calculates the percentage of change at
     *                    a given point in time (0-1 inclusive).
     * @static
     */
    generateEase: function (segments) {
        var qty = segments.length;
        var oneOverQty = 1 / qty;
        /*
         * Calculates the percentage of change at a given point in time (0-1 inclusive).
         * @param {Number} time The time of the ease, 0-1 inclusive.
         * @return {Number} The percentage of the change, 0-1 inclusive (unless your
         *                  ease goes outside those bounds).
         */
        return function (time) {
            var t, s;
            var i = (qty * time) | 0; //do a quick floor operation
            t = (time - (i * oneOverQty)) * qty;
            s = segments[i] || segments[qty - 1];
            return (s.s + t * (2 * (1 - t) * (s.cp - s.s) + t * (s.e - s.s)));
        };
    },
    /**
     * Gets a blend mode, ensuring that it is valid.
     * @method PIXI.particles.ParticleUtils.getBlendMode
     * @param {string} name The name of the blend mode to get.
     * @return {int} The blend mode as specified in the PIXI.BLEND_MODES enumeration.
     * @static
     */
    getBlendMode: function (name) {
        if (!name)
            return BLEND_MODES.NORMAL;
        name = name.toUpperCase();
        while (name.indexOf(" ") >= 0)
            name = name.replace(" ", "_");
        return BLEND_MODES[name] || BLEND_MODES.NORMAL;
    },
    /**
     * Converts a list of {value, time} objects starting at time 0 and ending at time 1 into an evenly
     * spaced stepped list of PropertyNodes for color values. This is primarily to handle conversion of
     * linear gradients to fewer colors, allowing for some optimization for Canvas2d fallbacks.
     * @method PIXI.particles.ParticleUtils.createSteppedGradient
     * @param {Array} list The list of data to convert.
     * @param {number} [numSteps=10] The number of steps to use.
     * @return {PIXI.particles.PropertyNode} The blend mode as specified in the PIXI.blendModes enumeration.
     * @static
     */
    createSteppedGradient: function (list, numSteps) {
        if (numSteps === void 0) { numSteps = 10; }
        if (typeof numSteps !== 'number' || numSteps <= 0)
            numSteps = 10;
        var first = new PropertyNode_1.default(list[0].value, list[0].time);
        first.isStepped = true;
        var currentNode = first;
        var current = list[0];
        var nextIndex = 1;
        var next = list[nextIndex];
        for (var i = 1; i < numSteps; ++i) {
            var lerp = i / numSteps;
            //ensure we are on the right segment, if multiple
            while (lerp > next.time) {
                current = next;
                next = list[++nextIndex];
            }
            //convert the lerp value to the segment range
            lerp = (lerp - current.time) / (next.time - current.time);
            var curVal = ParticleUtils.hexToRGB(current.value);
            var nextVal = ParticleUtils.hexToRGB(next.value);
            var output = {};
            output.r = (nextVal.r - curVal.r) * lerp + curVal.r;
            output.g = (nextVal.g - curVal.g) * lerp + curVal.g;
            output.b = (nextVal.b - curVal.b) * lerp + curVal.b;
            currentNode.next = new PropertyNode_1.default(output, i / numSteps);
            currentNode = currentNode.next;
        }
        //we don't need to have a PropertyNode for time of 1, because in a stepped version at that point
        //the particle has died of old age
        return first;
    }
};
exports.default = ParticleUtils;

},{"./PropertyNode":7}],5:[function(_dereq_,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var ParticleUtils_1 = _dereq_("./ParticleUtils");
var Particle_1 = _dereq_("./Particle");
/**
 * A helper point for math things.
 * @private
 */
var helperPoint = new PIXI.Point();
//a hand picked list of Math functions (and a couple properties) that are allowable.
//they should be used without the preceding "Math."
var MATH_FUNCS = [
    "pow",
    "sqrt",
    "abs",
    "floor",
    "round",
    "ceil",
    "E",
    "PI",
    "sin",
    "cos",
    "tan",
    "asin",
    "acos",
    "atan",
    "atan2",
    "log"
];
//create an actual regular expression object from the string
var WHITELISTER = new RegExp([
    //Allow the 4 basic operations, parentheses and all numbers/decimals, as well
    //as 'x', for the variable usage.
    "[01234567890\\.\\*\\-\\+\\/\\(\\)x ,]",
].concat(MATH_FUNCS).join("|"), "g");
/**
 * Parses a string into a function for path following.
 * This involves whitelisting the string for safety, inserting "Math." to math function
 * names, and using `new Function()` to generate a function.
 * @method PIXI.particles.PathParticle~parsePath
 * @private
 * @static
 * @param {String} pathString The string to parse.
 * @return {Function} The path function - takes x, outputs y.
 */
var parsePath = function (pathString) {
    var matches = pathString.match(WHITELISTER);
    for (var i = matches.length - 1; i >= 0; --i) {
        if (MATH_FUNCS.indexOf(matches[i]) >= 0)
            matches[i] = "Math." + matches[i];
    }
    pathString = matches.join("");
    return new Function("x", "return " + pathString + ";");
};
/**
 * An particle that follows a path defined by an algebraic expression, e.g. "sin(x)" or
 * "5x + 3".
 * To use this class, the particle config must have a "path" string in the
 * "extraData" parameter. This string should have "x" in it to represent movement (from the
 * speed settings of the particle). It may have numbers, parentheses, the four basic
 * operations, and the following Math functions or properties (without the preceding "Math."):
 * "pow", "sqrt", "abs", "floor", "round", "ceil", "E", "PI", "sin", "cos", "tan", "asin",
 * "acos", "atan", "atan2", "log".
 * The overall movement of the particle and the expression value become x and y positions for
 * the particle, respectively. The final position is rotated by the spawn rotation/angle of
 * the particle.
 *
 * Some example paths:
 *
 * 	"sin(x/10) * 20" // A sine wave path.
 * 	"cos(x/100) * 30" // Particles curve counterclockwise (for medium speed/low lifetime particles)
 * 	"pow(x/10, 2) / 2" // Particles curve clockwise (remember, +y is down).
 *
 * @memberof PIXI.particles
 * @class PathParticle
 * @extends PIXI.particles.Particle
 * @constructor
 * @param {PIXI.particles.Emitter} emitter The emitter that controls this PathParticle.
 */
var PathParticle = /** @class */ (function (_super) {
    __extends(PathParticle, _super);
    function PathParticle(emitter) {
        var _this = _super.call(this, emitter) || this;
        _this.path = null;
        _this.initialRotation = 0;
        _this.initialPosition = new PIXI.Point();
        _this.movement = 0;
        return _this;
    }
    /**
     * Initializes the particle for use, based on the properties that have to
     * have been set already on the particle.
     * @method PIXI.particles.PathParticle#init
     */
    PathParticle.prototype.init = function () {
        //get initial rotation before it is converted to radians
        this.initialRotation = this.rotation;
        //standard init
        this.Particle_init();
        //set the path for the particle
        this.path = this.extraData.path;
        //cancel the normal movement behavior
        this._doNormalMovement = !this.path;
        //reset movement
        this.movement = 0;
        //grab position
        this.initialPosition.x = this.position.x;
        this.initialPosition.y = this.position.y;
    };
    /**
     * Updates the particle.
     * @method PIXI.particles.PathParticle#update
     * @param {Number} delta Time elapsed since the previous frame, in __seconds__.
     */
    PathParticle.prototype.update = function (delta) {
        var lerp = this.Particle_update(delta);
        //if the particle died during the update, then don't bother
        if (lerp >= 0 && this.path) {
            //increase linear movement based on speed
            var speed = this.speedList.interpolate(lerp) * this.speedMultiplier;
            this.movement += speed * delta;
            //set up the helper point for rotation
            helperPoint.x = this.movement;
            helperPoint.y = this.path(this.movement);
            ParticleUtils_1.default.rotatePoint(this.initialRotation, helperPoint);
            this.position.x = this.initialPosition.x + helperPoint.x;
            this.position.y = this.initialPosition.y + helperPoint.y;
        }
        return lerp;
    };
    /**
     * Destroys the particle, removing references and preventing future use.
     * @method PIXI.particles.PathParticle#destroy
     */
    PathParticle.prototype.destroy = function () {
        this.Particle_destroy();
        this.path = this.initialPosition = null;
    };
    /**
     * Checks over the art that was passed to the Emitter's init() function, to do any special
     * modifications to prepare it ahead of time. This just runs Particle.parseArt().
     * @method PIXI.particles.PathParticle.parseArt
     * @static
     * @param  {Array} art The array of art data. For Particle, it should be an array of Textures.
     *                     Any strings in the array will be converted to Textures via
     *                     Texture.fromImage().
     * @return {Array} The art, after any needed modifications.
     */
    PathParticle.parseArt = function (art) {
        return Particle_1.default.parseArt(art);
    };
    /**
     * Parses extra emitter data to ensure it is set up for this particle class.
     * PathParticle checks for the existence of path data, and parses the path data for use
     * by particle instances.
     * @method PIXI.particles.PathParticle.parseData
     * @static
     * @param  {Object} extraData The extra data from the particle config.
     * @return {Object} The parsed extra data.
     */
    PathParticle.parseData = function (extraData) {
        var output = {};
        if (extraData && extraData.path) {
            try {
                output.path = parsePath(extraData.path);
            }
            catch (e) {
                if (ParticleUtils_1.default.verbose)
                    console.error("PathParticle: error in parsing path expression");
                output.path = null;
            }
        }
        else {
            if (ParticleUtils_1.default.verbose)
                console.error("PathParticle requires a path string in extraData!");
            output.path = null;
        }
        return output;
    };
    return PathParticle;
}(Particle_1.default));
exports.default = PathParticle;

},{"./Particle":3,"./ParticleUtils":4}],6:[function(_dereq_,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ParticleUtils_1 = _dereq_("./ParticleUtils");
/**
 * Singly linked list container for keeping track of interpolated properties for particles.
 * Each Particle will have one of these for each interpolated property.
 * @memberof PIXI.particles
 * @class PropertyList
 * @constructor
 * @param {boolean} isColor If this list handles color values
 */
var PropertyList = /** @class */ (function () {
    function PropertyList(isColor) {
        if (isColor === void 0) { isColor = false; }
        this.current = null;
        this.next = null;
        this.isColor = !!isColor;
        this.interpolate = null;
        this.ease = null;
    }
    /**
     * Resets the list for use.
     * @method interpolate
     * @param {PIXI.particles.PropertyNode} first The first node in the list.
     * @param {boolean} [isStepped=false] If the values should be stepped instead of interpolated linearly.
     */
    PropertyList.prototype.reset = function (first) {
        this.current = first;
        this.next = first.next;
        var isSimple = this.next && this.next.time >= 1;
        if (isSimple) {
            this.interpolate = this.isColor ? intColorSimple : intValueSimple;
        }
        else if (first.isStepped) {
            this.interpolate = this.isColor ? intColorStepped : intValueStepped;
        }
        else {
            this.interpolate = this.isColor ? intColorComplex : intValueComplex;
        }
        this.ease = this.current.ease;
    };
    return PropertyList;
}());
exports.default = PropertyList;
function intValueSimple(lerp) {
    if (this.ease)
        lerp = this.ease(lerp);
    return (this.next.value - this.current.value) * lerp + this.current.value;
}
function intColorSimple(lerp) {
    if (this.ease)
        lerp = this.ease(lerp);
    var curVal = this.current.value, nextVal = this.next.value;
    var r = (nextVal.r - curVal.r) * lerp + curVal.r;
    var g = (nextVal.g - curVal.g) * lerp + curVal.g;
    var b = (nextVal.b - curVal.b) * lerp + curVal.b;
    return ParticleUtils_1.default.combineRGBComponents(r, g, b);
}
function intValueComplex(lerp) {
    if (this.ease)
        lerp = this.ease(lerp);
    //make sure we are on the right segment
    while (lerp > this.next.time) {
        this.current = this.next;
        this.next = this.next.next;
    }
    //convert the lerp value to the segment range
    lerp = (lerp - this.current.time) / (this.next.time - this.current.time);
    return (this.next.value - this.current.value) * lerp + this.current.value;
}
function intColorComplex(lerp) {
    if (this.ease)
        lerp = this.ease(lerp);
    //make sure we are on the right segment
    while (lerp > this.next.time) {
        this.current = this.next;
        this.next = this.next.next;
    }
    //convert the lerp value to the segment range
    lerp = (lerp - this.current.time) / (this.next.time - this.current.time);
    var curVal = this.current.value, nextVal = this.next.value;
    var r = (nextVal.r - curVal.r) * lerp + curVal.r;
    var g = (nextVal.g - curVal.g) * lerp + curVal.g;
    var b = (nextVal.b - curVal.b) * lerp + curVal.b;
    return ParticleUtils_1.default.combineRGBComponents(r, g, b);
}
function intValueStepped(lerp) {
    if (this.ease)
        lerp = this.ease(lerp);
    //make sure we are on the right segment
    while (this.next && lerp > this.next.time) {
        this.current = this.next;
        this.next = this.next.next;
    }
    return this.current.value;
}
function intColorStepped(lerp) {
    if (this.ease)
        lerp = this.ease(lerp);
    //make sure we are on the right segment
    while (this.next && lerp > this.next.time) {
        this.current = this.next;
        this.next = this.next.next;
    }
    var curVal = this.current.value;
    return ParticleUtils_1.default.combineRGBComponents(curVal.r, curVal.g, curVal.b);
}

},{"./ParticleUtils":4}],7:[function(_dereq_,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ParticleUtils_1 = _dereq_("./ParticleUtils");
/**
 * A single node in a PropertyList.
 * @memberof PIXI.particles
 * @class PropertyNode
 * @constructor
 * @param {number|string} value The value for this node
 * @param {number} time The time for this node, between 0-1
 * @param {Function|Array} [ease] Custom ease for this list. Only relevant for the first node.
 */
var PropertyNode = /** @class */ (function () {
    function PropertyNode(value, time, ease) {
        this.value = typeof value == "string" ? ParticleUtils_1.default.hexToRGB(value) : value;
        this.time = time;
        this.next = null;
        this.isStepped = false;
        if (ease) {
            this.ease = typeof ease == "function" ? ease : ParticleUtils_1.default.generateEase(ease);
        }
        else {
            this.ease = null;
        }
    }
    /**
     * Creates a list of property values from a data object {list, isStepped} with a list of objects in
     * the form {value, time}. Alternatively, the data object can be in the deprecated form of
     * {start, end}.
     * @method PIXI.particles.PropertyNode.createListFromArray
     * @static
     * @param  {Object} data The data for the list.
     * @param  {Array} data.list The array of value and time objects.
     * @param  {boolean} [data.isStepped] If the list is stepped rather than interpolated.
     * @param  {Function|Array} [data.ease] Custom ease for this list.
     * @return {PIXI.particles.PropertyNode} The first node in the list
     */
    PropertyNode.createList = function (data) {
        if (Array.isArray(data.list)) {
            var array = data.list;
            var node = void 0, first = void 0;
            first = node = new PropertyNode(array[0].value, array[0].time, data.ease);
            //only set up subsequent nodes if there are a bunch or the 2nd one is different from the first
            if (array.length > 2 || (array.length === 2 && array[1].value !== array[0].value)) {
                for (var i = 1; i < array.length; ++i) {
                    node.next = new PropertyNode(array[i].value, array[i].time);
                    node = node.next;
                }
            }
            first.isStepped = !!data.isStepped;
            return first;
        }
        else {
            //Handle deprecated version here
            var start = new PropertyNode(data.start, 0);
            //only set up a next value if it is different from the starting value
            if (data.end !== data.start)
                start.next = new PropertyNode(data.end, 1);
            return start;
        }
    };
    return PropertyNode;
}());
exports.default = PropertyNode;

},{"./ParticleUtils":4}],8:[function(_dereq_,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ParticleUtils_js_1 = _dereq_("./ParticleUtils.js");
exports.ParticleUtils = ParticleUtils_js_1.default;
var Particle_js_1 = _dereq_("./Particle.js");
exports.Particle = Particle_js_1.default;
var Emitter_js_1 = _dereq_("./Emitter.js");
exports.Emitter = Emitter_js_1.default;
var PathParticle_js_1 = _dereq_("./PathParticle.js");
exports.PathParticle = PathParticle_js_1.default;
var AnimatedParticle_js_1 = _dereq_("./AnimatedParticle.js");
exports.AnimatedParticle = AnimatedParticle_js_1.default;

},{"./AnimatedParticle.js":1,"./Emitter.js":2,"./Particle.js":3,"./ParticleUtils.js":4,"./PathParticle.js":5}],9:[function(_dereq_,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// If we're in the browser make sure PIXI is available
if (typeof PIXI === 'undefined') {
    throw "pixi-particles requires pixi.js to be loaded first";
}
//ensure that the particles namespace exist - PIXI 4 creates it itself, PIXI 3 does not
if (!PIXI.particles) {
    PIXI.particles = {};
}
// get the library itself
var particles = _dereq_("./particles");
// insert the library into the particles namespace on PIXI
for (var prop in particles) {
    PIXI.particles[prop] = particles[prop];
}

},{"./particles":8}]},{},[9])(9)
});


//# sourceMappingURL=pixi-particles.js.map
