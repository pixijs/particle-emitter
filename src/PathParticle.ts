import { ParticleUtils } from './ParticleUtils';
import { Particle } from './Particle';
import { Emitter } from './Emitter';
import { Point, Texture } from 'pixi.js';

/**
 * A helper point for math things.
 * @hidden
 */
const helperPoint = new Point();

/**
 * A hand picked list of Math functions (and a couple properties) that are
 * allowable. They should be used without the preceding "Math."
 * @hidden
 */
const MATH_FUNCS = [
    'pow',
    'sqrt',
    'abs',
    'floor',
    'round',
    'ceil',
    'E',
    'PI',
    'sin',
    'cos',
    'tan',
    'asin',
    'acos',
    'atan',
    'atan2',
    'log',
];
/**
 * create an actual regular expression object from the string
 * @hidden
 */
const WHITELISTER = new RegExp(
    [
        // Allow the 4 basic operations, parentheses and all numbers/decimals, as well
        // as 'x', for the variable usage.
        '[01234567890\\.\\*\\-\\+\\/\\(\\)x ,]',
    ].concat(MATH_FUNCS).join('|'),
    'g',
);

/**
 * Parses a string into a function for path following.
 * This involves whitelisting the string for safety, inserting "Math." to math function
 * names, and using `new Function()` to generate a function.
 * @hidden
 * @param pathString The string to parse.
 * @return The path function - takes x, outputs y.
 */
function parsePath(pathString: string): (x: number) => number
{
    const matches = pathString.match(WHITELISTER);

    for (let i = matches.length - 1; i >= 0; --i)
    {
        if (MATH_FUNCS.indexOf(matches[i]) >= 0)
        { matches[i] = `Math.${matches[i]}`; }
    }
    pathString = matches.join('');

    // eslint-disable-next-line no-new-func
    return new Function('x', `return ${pathString};`) as (x: number) => number;
}

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
 */
export class PathParticle extends Particle
{
    /**
     * The function representing the path the particle should take.
     */
    public path: Function;
    /**
     * The initial rotation in degrees of the particle, because the direction of the path
     * is based on that.
     */
    public initialRotation: number;
    /**
     * The initial position of the particle, as all path movement is added to that.
     */
    public initialPosition: Point;
    /**
     * Total single directional movement, due to speed.
     */
    public movement: number;

    /**
     * @param {PIXI.particles.Emitter} emitter The emitter that controls this PathParticle.
     */
    constructor(emitter: Emitter)
    {
        super(emitter);
        this.path = null;
        this.initialRotation = 0;
        this.initialPosition = new Point();
        this.movement = 0;
    }

    /**
     * Initializes the particle for use, based on the properties that have to
     * have been set already on the particle.
     */
    public init(): void
    {
        // get initial rotation before it is converted to radians
        this.initialRotation = this.rotation;
        // standard init
        this.Particle_init();

        // set the path for the particle
        this.path = this.extraData.path;
        // cancel the normal movement behavior
        this._doNormalMovement = !this.path;
        // reset movement
        this.movement = 0;
        // grab position
        this.initialPosition.x = this.position.x;
        this.initialPosition.y = this.position.y;
    }

    /**
     * Updates the particle.
     * @param delta Time elapsed since the previous frame, in __seconds__.
     */
    public update(delta: number): number
    {
        const lerp = this.Particle_update(delta);
        // if the particle died during the update, then don't bother

        if (lerp >= 0 && this.path)
        {
            // increase linear movement based on speed
            if (this._doSpeed)
            {
                const speed = this.speedList.interpolate(lerp) * this.speedMultiplier;

                this.movement += speed * delta;
            }
            else
            {
                const speed = this.speedList.current.value * this.speedMultiplier;

                this.movement += speed * delta;
            }
            // set up the helper point for rotation
            helperPoint.x = this.movement;
            helperPoint.y = this.path(this.movement);
            ParticleUtils.rotatePoint(this.initialRotation, helperPoint);
            this.position.x = this.initialPosition.x + helperPoint.x;
            this.position.y = this.initialPosition.y + helperPoint.y;
        }

        return lerp;
    }

    /**
     * Destroys the particle, removing references and preventing future use.
     */
    public destroy(): void
    {
        this.Particle_destroy();
        this.path = this.initialPosition = null;
    }

    /**
     * Checks over the art that was passed to the Emitter's init() function, to do any special
     * modifications to prepare it ahead of time. This just runs Particle.parseArt().
     * @param art The array of art data. For Particle, it should be an array of
     *            Textures. Any strings in the array will be converted to
     *            Textures via Texture.fromImage().
     * @return The art, after any needed modifications.
     */
    public static parseArt(art: (Texture|string)[]): Texture[]
    {
        return Particle.parseArt(art);
    }

    /**
     * Parses extra emitter data to ensure it is set up for this particle class.
     * PathParticle checks for the existence of path data, and parses the path data for use
     * by particle instances.
     * @param extraData The extra data from the particle config.
     * @return The parsed extra data.
     */
    public static parseData(extraData: {path: string}): any
    {
        const output: any = {};

        if (extraData && extraData.path)
        {
            try
            {
                output.path = parsePath(extraData.path);
            }
            catch (e)
            {
                if (ParticleUtils.verbose)
                {
                    console.error('PathParticle: error in parsing path expression');
                }
                output.path = null;
            }
        }
        else
        {
            if (ParticleUtils.verbose)
            {
                console.error('PathParticle requires a path string in extraData!');
            }
            output.path = null;
        }

        return output;
    }
}
