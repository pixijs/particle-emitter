(function (window)
{
    /* global PIXI */
    /* eslint-disable newline-after-var,prefer-template */
    /**
    *  Basic example setup
    *  @class ParticleExample
    *  @constructor
    *  @param {String[]} imagePaths The local path to the image source
    *  @param {Object} config The emitter configuration
    *  @param {null|'path'|'anim'} [type=null] Particle type to create.
    *  @param {boolean} [testContainers=false] If changing containers should be enabled.
    *  @param {boolean} [stepColors=false] If the color settings should be manually stepped.
    */
    class ParticleExample
    {
        constructor(imagePaths, config, type, testContainers, stepColors)
        {
            const canvas = document.getElementById('stage');
            // Basic PIXI Setup
            const rendererOptions = {
                width: canvas.width,
                height: canvas.height,
                view: canvas,
            };
            /* var preMultAlpha = !!options.preMultAlpha;
            if(rendererOptions.transparent && !preMultAlpha)
                rendererOptions.transparent = 'notMultiplied';*/
            this.stage = new PIXI.Container();
            this.emitter = null;
            this.renderer = new PIXI.Renderer(rendererOptions);
            this.bg = null;
            this.updateHook = null;
            this.containerHook = null;

            const framerate = document.getElementById('framerate');
            const particleCount = document.getElementById('particleCount');
            const containerType = document.getElementById('containerType');

            // Calculate the current time
            let elapsed = Date.now();
            let updateId;

            // Update function every frame
            const update = () =>
            {
                // Update the next frame
                updateId = requestAnimationFrame(update);

                const now = Date.now();
                if (this.emitter)
                {
                    // update emitter (convert to seconds)
                    this.emitter.update((now - elapsed) * 0.001);
                }

                // call update hook for specialist examples
                if (this.updateHook)
                {
                    this.updateHook(now - elapsed);
                }

                framerate.innerHTML = `${(1000 / (now - elapsed)).toFixed(2)} fps`;

                elapsed = now;

                if (this.emitter && particleCount)
                {
                    particleCount.innerHTML = `${this.emitter.particleCount} particles`;
                }

                // render the stage
                this.renderer.render(this.stage);
            };

            // Resize the canvas to the size of the window
            window.onresize = () =>
            {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                this.renderer.resize(canvas.width, canvas.height);
                if (this.bg)
                {
                    // bg is a 1px by 1px image
                    this.bg.scale.x = canvas.width;
                    this.bg.scale.y = canvas.height;
                }
            };
            window.onresize();

            // Preload the particle images and create PIXI textures from it
            let urls;
            let makeTextures = false;
            if (imagePaths.spritesheet)
            {
                urls = [imagePaths.spritesheet];
            }
            else if (imagePaths.textures)
            {
                urls = imagePaths.textures.slice();
            }
            else
            {
                urls = imagePaths.slice();
                makeTextures = true;
            }
            urls.push('images/bg.png');
            const loader = PIXI.Loader.shared;
            for (let i = 0; i < urls.length; ++i)
            {
                loader.add('img' + i, urls[i]);
            }
            loader.load(() =>
            {
                this.bg = new PIXI.Sprite(PIXI.Texture.from('images/bg.png'));
                // bg is a 1px by 1px image
                this.bg.scale.x = canvas.width;
                this.bg.scale.y = canvas.height;
                this.bg.tint = 0x000000;
                this.stage.addChild(this.bg);
                // collect the textures, now that they are all loaded
                let art;
                if (makeTextures)
                {
                    art = [];
                    for (let i = 0; i < imagePaths.length; ++i)
                    {
                        art.push(PIXI.Texture.from(imagePaths[i]));
                    }
                }
                else
                {
                    art = imagePaths.art;
                }
                // Create the new emitter and attach it to the stage
                let parentType = 0;
                function getContainer()
                {
                    switch (parentType)
                    {
                        case 1:
                            const pc = new PIXI.ParticleContainer();
                            pc.setProperties({
                                scale: true,
                                position: true,
                                rotation: true,
                                uvs: true,
                                alpha: true,
                            });

                            return [pc, 'PIXI.ParticleContainer'];
                        case 2:
                            return [new PIXI.particles.LinkedListContainer(), 'PIXI.particles.LinkedListContainer'];
                        default:
                            return [new PIXI.Container(), 'PIXI.Container'];
                    }
                }
                let [emitterContainer, containerName] = getContainer();
                this.stage.addChild(emitterContainer);
                if (containerType) containerType.innerHTML = containerName;

                window.emitter = this.emitter = new PIXI.particles.Emitter(
                    emitterContainer,
                    art,
                    config,
                );
                if (stepColors)
                {
                    this.emitter.startColor = PIXI.particles.ParticleUtils.createSteppedGradient(
                        config.color.list,
                        stepColors
                    );
                }
                if (type === 'path')
                {
                    this.emitter.particleConstructor = PIXI.particles.PathParticle;
                }
                else if (type === 'anim')
                {
                    this.emitter.particleConstructor = PIXI.particles.AnimatedParticle;
                }

                // Center on the stage
                this.emitter.updateOwnerPos(window.innerWidth / 2, window.innerHeight / 2);

                // Click on the canvas to trigger
                canvas.addEventListener('mouseup', (e) =>
                {
                    if (!this.emitter) return;

                    // right click (or anything but left click)
                    if (e.button)
                    {
                        if (testContainers)
                        {
                            if (++parentType >= 3) parentType = 0;
                            const oldParent = emitterContainer;
                            [emitterContainer, containerName] = getContainer();
                            if (containerType) containerType.innerHTML = containerName;
                            this.stage.addChild(emitterContainer);
                            this.emitter.parent = emitterContainer;
                            this.stage.removeChild(oldParent);
                            oldParent.destroy();

                            if (this.containerHook)
                            {
                                this.containerHook();
                            }
                        }
                    }
                    else
                    {
                        this.emitter.emit = true;
                        this.emitter.resetPositionTracking();
                        this.emitter.updateOwnerPos(e.offsetX || e.layerX, e.offsetY || e.layerY);
                    }
                });

                document.body.addEventListener('contextmenu', (e) =>
                {
                    e.preventDefault();

                    return false;
                });

                // Start the update
                update();

                // for testing and debugging
                window.destroyEmitter = () =>
                {
                    this.emitter.destroy();
                    this.emitter = null;
                    window.destroyEmitter = null;
                    // cancelAnimationFrame(updateId);

                    // reset SpriteRenderer's batching to fully release particles for GC
                    // if (this.renderer.plugins && this.renderer.plugins.sprite && this.renderer.plugins.sprite.sprites)
                    // {
                    //     this.renderer.plugins.sprite.sprites.length = 0;
                    // }

                    this.renderer.render(this.stage);
                };
            });
        }
    }

    // Assign to global space
    window.ParticleExample = ParticleExample;
})(window);
