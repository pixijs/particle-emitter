import { Point } from '@pixi/math';
import { Particle } from '../Particle';
import { ParticleUtils } from '../ParticleUtils';
import { PropertyList } from '../PropertyList';
import { PropertyNode, ValueList } from '../PropertyNode';
import { IEmitterBehavior, BehaviorOrder } from './Behaviors';

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
    'E',
    'LN2',
    'LN10',
    'LOG2E',
    'LOG10E',
    'PI',
    'SQRT1_2',
    'SQRT2',
    'abs',
    'acos',
    'acosh',
    'asin',
    'asinh',
    'atan',
    'atanh',
    'atan2',
    'cbrt',
    'ceil',
    'cos',
    'cosh',
    'exp',
    'expm1',
    'floor',
    'fround',
    'hypot',
    'log',
    'log1p',
    'log10',
    'log2',
    'max',
    'min',
    'pow',
    'random',
    'round',
    'sign',
    'sin',
    'sinh',
    'sqrt',
    'tan',
    'tanh',
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
 * A particle that follows a path defined by an algebraic expression, e.g. "sin(x)" or
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
export class PathBehavior implements IEmitterBehavior
{
    public static type = 'movePath';

    // *MUST* happen after other behaviors do initialization so that we can read initial transformations
    public order = BehaviorOrder.Late;
    /**
     * The function representing the path the particle should take.
     */
    private path: (x: number) => number;
    private list: PropertyList<number>;
    private minMult: number;
    constructor(config: {
        /**
         * Property: path
         * Type: string
         * Title: Path
         * Description: Algebraic expression describing the movement of the particle.
         */
        path: string|((x: number) => number);
        /**
         * Property: speed
         * Type: ValueList<number>
         * Title: Speed
         * Description: Speed of the particles, with a minimum value of 0. this affects the x value in the path.
         * Min: 0
         * EditorDefault: 100
         */
        speed: ValueList<number>;
        /**
         * Property: minMult
         * Type: number
         * Title: Minimum Speed Multiplier
         * Description: A value between minimum speed multipler and 1 is randomly generated and multiplied with each speed value to generate the actual speed for each particle.
         * Min: 0
         * Max: 1
         * EditorDefault: 1
         */
        minMult: number;
    })
    {
        if (config.path)
        {
            if (typeof config.path === 'function')
            {
                this.path = config.path;
            }
            else
            {
                try
                {
                    this.path = parsePath(config.path);
                }
                catch (e)
                {
                    if (ParticleUtils.verbose)
                    {
                        console.error('PathParticle: error in parsing path expression');
                    }
                    this.path = null;
                }
            }
        }
        else
        {
            if (ParticleUtils.verbose)
            {
                console.error('PathParticle requires a path string in extraData!');
            }
            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
            this.path = (x) => x;
        }
        this.list = new PropertyList(false);
        this.list.reset(PropertyNode.createList(config.speed));
        this.minMult = config.minMult ?? 1;
    }

    initParticles(first: Particle): void
    {
        let next = first;

        while (next)
        {
            /*
             * The initial rotation in degrees of the particle, because the direction of the path
             * is based on that.
             */
            next.config.initRotation = next.rotation;
            /* The initial position of the particle, as all path movement is added to that. */
            if (!next.config.initPosition)
            {
                next.config.initPosition = new Point(next.x, next.y);
            }
            else
            {
                (next.config.initPosition as Point).copyFrom(next.position);
            }
            /* Total single directional movement, due to speed. */
            next.config.movement = 0;

            // also do speed multiplier, since this includes basic speed movement
            const mult = (Math.random() * (1 - this.minMult)) + this.minMult;

            next.config.speedMult = mult;

            next = next.next;
        }
    }

    updateParticle(particle: Particle, deltaSec: number): void
    {
        // increase linear movement based on speed
        const speed = this.list.interpolate(particle.agePercent) * particle.config.speedMult;

        particle.config.movement += speed * deltaSec;
        // set up the helper point for rotation
        helperPoint.x = particle.config.movement;
        helperPoint.y = this.path(helperPoint.x);
        ParticleUtils.rotatePoint(particle.config.initRotation, helperPoint);
        particle.position.x = particle.config.initPosition.x + helperPoint.x;
        particle.position.y = particle.config.initPosition.y + helperPoint.y;
    }
}
