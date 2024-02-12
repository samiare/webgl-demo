/* =============================================================================
 * Vertex Shader
 * ========================================================================== */

export const vertexSource = `
attribute vec2 position;

void main(void) {
    // In a 2D example, we don't need transformation matrices. The only object
    // is a single rectangle made of two triangles. The vertex positions are
    // already set to the four corners of the view space.
    //
    // Additionally, position is a vec2 instead of a vec3 because we didn't need
    // information in the third dimension. gl_Position always expects a vec4
    // though so we added a z-component of 0.0 (origin) and w-component of 1.0.
    gl_Position = vec4(position, 0.0, 1.0);
}
`

/* =============================================================================
 * Fragment Shader
 * ========================================================================== */

export const fragmentSource = `
#define PI ${Math.PI}
#define PI_2 ${Math.PI * 2}

precision mediump float;

uniform sampler2D texture;
uniform vec2 textureSize;
uniform vec2 waveAmt;
uniform vec2 waveCount;
uniform bool interleave;

void main(void) {
    vec2 texPos = gl_FragCoord.xy / textureSize;

    float flipX = 1.0;
    if (interleave && mod(gl_FragCoord.y, 4.0) < 2.0) {
        flipX = -1.0;
    }

    float flipY = 1.0;
    if (interleave && mod(gl_FragCoord.x, 4.0) < 2.0) {
        flipY = -1.0;
    }

    texPos.x += sin(texPos.y * PI_2 * waveCount.x) * waveAmt.x * flipX;
    texPos.y += sin(texPos.x * PI_2 * waveCount.y) * waveAmt.y * flipY;

    vec4 texCol = texture2D(texture, texPos);

    gl_FragColor = vec4(texCol.rgb, 1.0);
}
`

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

