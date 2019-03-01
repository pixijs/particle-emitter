export {default as ParticleUtils} from "./ParticleUtils.js";
export {default as Particle} from "./Particle.js";
export {default as Emitter} from "./Emitter.js";
export {default as PathParticle} from "./PathParticle.js";
export {default as AnimatedParticle} from "./AnimatedParticle.js";

/*#if _IIFE
// for IIFE we want to merge our exports with PIXI.particles, but we
// can't export * from namespaces, so we have export by name (which is brittle)
import {particles} from 'pixi.js';
import ParticleRenderer = particles.ParticleRenderer;
import ParticleContainer = particles.ParticleContainer;
export {ParticleRenderer, ParticleContainer};
//#endif */
