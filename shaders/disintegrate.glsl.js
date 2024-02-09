import noise from './lib/noise.glsl.js'

/* =============================================================================
 * Variable Types and Qualifiers
 * =============================================================================
 * See: https://www.khronos.org/opengl/wiki/Data_Type_(GLSL)
 *      https://www.khronos.org/opengl/wiki/Type_Qualifier_(GLSL)
 *
 * Scalars      Single values
 * -----------------------------------------------------------------------------
 * bool       - A boolean value.
 * int        - A signed (can be positive or negative) integer.
 * uint       - An unsigned (can only be positive) integer.
 * float      - Single-precision floating point number.
 * double     - Double-precision floating point number.
 *
 * Vectors      A collection of scalars, where n is 2, 3 or 4, ex: uvec3 or vec2
 * -----------------------------------------------------------------------------
 * bvec[n]    - A vector of booleans.
 * ivec[n]    - A vector of signed integers.
 * uvec[n]    - A vector of unsigned integers.
 * vec[n]     - A vector of floats.
 * dvec[n]    - A vector of doubles.
 *
 * Matrices     Matrices are two-dimensional collections of float values
 * -----------------------------------------------------------------------------
 * mat[n]x[m] - A matrix with n columns and m rows.
 * mat[n]     - A matrix with n columns and rows.
 *
 * =============================================================================
 *
 * -----------------------------------------------------------------------------
 * Qualifiers   These dictate how data is passed into and between shaders
 * -----------------------------------------------------------------------------
 * #define    - A #define statement is like a fancy copy/paste. Wherever the
 *              compiler sees the variable name, it will paste the value into
 *              the code. Hence, there is no type given to a #define.
 * uniform    - Uniforms are values that global to a draw call, meaning that for
 *              any frame of animation, the value of a uniform will be the same
 *              for every fragment and vertex shader that accesses it.
 * attribute  - Attributes are per-vertex values. They can only be accessed in
 *              the vertex shader stage.
 * varying    - Varyings are values that are defined in the vertex shader stage
 *              and can be read from the fragment shader. Because a fragment
 *              doesn't line up one-to-one with a vertex, the value of a varying
 *              will be smoothly interpolated between the value set by the 3
 *              vertices that contain the triangle for the current fragment.
 *              Later versions of GLSL drop the varying keyword in favor of in
 *              and out, to account for workflows with more shader stages.
 *
 * =============================================================================
 */

export const vertexSource = `
#define PI ${Math.PI}
#define PI_2 ${Math.PI * 2}

precision mediump float;

uniform mat4 uModelViewMatrix;      // Transformation of the model from its origin
uniform mat4 uProjectionMatrix;     // Transformation for the perspective camera
uniform float uTime;                // Time in ms since the animation started
uniform float uProgress;            // Value from 0.0 to 1.0 that controls the animation

attribute vec3 position;
attribute vec4 color;
attribute vec3 normal;
attribute vec2 uv;

varying vec4 vColor;
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

float round(float value) {
    return floor(value + 0.5);
}

float cutoffRound(float value, float place) {
    return float(round(value / place)) * place;
}

vec2 cutoffRound(vec2 value, float place) {
    return vec2(
        cutoffRound(value.x, place),
        cutoffRound(value.y, place)
    );
}

vec3 cutoffRound(vec3 value, float place) {
    return vec3(
        cutoffRound(value.x, place),
        cutoffRound(value.y, place),
        cutoffRound(value.z, place)
    );
}

vec4 cutoffRound(vec4 value, float place) {
    return vec4(
        cutoffRound(value.x, place),
        cutoffRound(value.y, place),
        cutoffRound(value.z, place),
        cutoffRound(value.w, place)
    );
}

void main(void) {
    vec4 localPosition = vec4(position, 1.0);
    vec3 normalOffset = normal * uProgress;
    float progressInverse = 1.0 - uProgress;

    // Pushes vertices out in the direction of the normal
    //localPosition = vec4(position + normalOffset, 1.0);

    // Shrinks the vertices towards the origin: [0.0, 0.0, 0.0]
    //localPosition = vec4(position * progressInverse, 1.0);

    // Set the output position to screenPosition.
    // Multiplying a matrix with a vector essentially applies the transforms on
    // that matrix to the vector. In this case, it applies camera perspective
    // and rotation/translation of the object.
    gl_Position = uProjectionMatrix * uModelViewMatrix * localPosition;

    // Rounds X and Y values to the nearest value of fractionalRound, creating
    // a "snapping" effect, where vertices don't move smoothly but instead
    // lock to specific grid points.
    //float fractionalRound = 0.3;
    //gl_Position.xy = cutoffRound(gl_Position.xy, fractionalRound);

    // Pass attributes to fragment shader as varyings
    vColor = color;
    vUv = uv;
    vPosition = position.xyz;
    vNormal = mat3(uModelViewMatrix) * normal;
}
`

export const fragmentSource = `
#define PI ${Math.PI}
#define PI_2 ${Math.PI * 2}

precision mediump float;

uniform float uTime;            // Time in ms since the animation started
uniform float uProgress;        // Value from 0.0 to 1.0 that controls the animation
uniform sampler2D uTexture0;    // First input texture
uniform sampler2D uTexture1;    // Second input texture

varying vec4 vColor;
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

${noise}

float clampToOne(float value) {
    return min(1.0, max(0.0, value));
}

float twoSidedCurve(float value, float offset, float width) {
    float wideOffset = 1.0 / (1.0 + (1.0 / width));
    float x = clampToOne((value / width) + 1.0 - (offset / wideOffset));
    float y = (sin(PI_2 * (x - 0.25)) + 1.0) / 2.0;
    return y;
}

float oneSidedCurve(float value, float offset, float width) {
    float y = twoSidedCurve(value, offset, width);
    return (offset * (1.0 + width)) - (width / 2.0) >= value ? 1.0 : y;
}

void main(void) {
    // Texture to wrap around the cube
    vec4 texture = texture2D(uTexture0, vUv);

    // Noise value used for the disintegration mask
    float edgeNoise = clampToOne(
        cnoiseNorm(vPosition * 2.0)
    );

    // edgeNoise with cutoff
    float edgeMask = edgeNoise >= uProgress ? 1.0 : 0.0;

    // Animated noise used for the glowing edge noise
    float flakeNoise = clampToOne(
        cnoiseNorm(vec4(
            vPosition * 10.0,
            uTime * 0.5
        ) + vColor.rgba
        )
    );

    // Masks used for the flakeNoise
    float flakeRingMask = oneSidedCurve(edgeNoise, uProgress, 0.75);

    // Noise, masked out
    float flakeMask = flakeRingMask * flakeNoise;



    // This is a simple hack to fake lighting by finding the angle between a
    // face's normal and the direction we want light to be coming from, and
    // darkening the output color based on that value.
    float shadowValue = dot(
        normalize(vNormal),
        normalize(vec3(0.0, 0.0, 1.0))
    );
    vec4 shadow = vec4(vec3(max(0.4, shadowValue)), 1.0);
    vec4 shadowedTexture = texture * shadow;

    // Pulsating color for the edge effect
    vec4 burnColor = mix(
        vec4(0.5, 0.15, 0.15, 1.0),
        vec4(1.0, 0.1, 0.1, 1.0),
        sin(uTime * 0.5 * PI_2)
    );
    vec4 burnedTexture = texture * burnColor;

    // Use the flakeMask to switch between the two values
    if (flakeMask >= 0.2) {
        gl_FragColor = burnedTexture;
    } else {
        gl_FragColor = shadowedTexture;
    }

    // These reveal the different masks and noise patterns used for the effect
    //gl_FragColor = vec4(vec3(edgeNoise), 1.0);
    //gl_FragColor = vec4(vec3(edgeMask), 1.0);
    //gl_FragColor = vec4(vec3(flakeNoise), 1.0);
    //gl_FragColor = vec4(vec3(flakeRingMask), 1.0);
    //gl_FragColor = vec4(vec3(flakeMask), 1.0);
    //gl_FragColor = vColor;
    //gl_FragColor = texture;
    //gl_FragColor = shadow;
    //gl_FragColor = shadowedTexture;
    //gl_FragColor = burnColor;
    //gl_FragColor = burnedTexture;

    if (edgeMask <= 0.0) {
        discard;
    }

    // Rather than discarding a fragment altogether, we could set the alpha
    // value of the color and have different amounts of transparency. For this
    // to work, changes have to be made in the draw function to enable blending.
    // However this *still* isn't enough. You will see some faces of the box
    // drawn on top of other faces that they should appear behind. For depth
    // blending to work, the faces *must* be drawn from back to front, which
    // would changes in the JS drawing code to accomplish.
    //gl_FragColor.a = 1.0 - edgeMask;
}
`
