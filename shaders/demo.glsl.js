/* =============================================================================
 * Vertex Shader
 * ========================================================================== */

export const vertexSource = `
precision mediump float;

uniform mat4 uModelViewMatrix;      // Transformation of the model from its origin
uniform mat4 uProjectionMatrix;     // Transformation for the perspective camera
uniform bool uCheckbox;

attribute vec3 position;
attribute vec4 color;
attribute vec3 normal;
attribute vec2 uv;

varying vec3 vPosition;
varying vec4 vColor;
varying vec3 vNormal;
varying vec2 vUv;

void main(void) {
    vec4 projectedPosition = uProjectionMatrix * uModelViewMatrix * vec4(position, 1.0);

    // The final position, in normalized space, of the vertex
    gl_Position = projectedPosition;

    // Pass these values to the fragment shader
    vColor = color;
    vNormal = mat3(uModelViewMatrix) * normal;
    vUv = uv;
}
`

/* =============================================================================
 * Fragment Shader
 * ========================================================================== */

export const fragmentSource = `
precision mediump float;

varying vec4 vColor;
varying vec3 vNormal;
varying vec2 vUv;

void main(void) {
    gl_FragColor = vColor;
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
