/* =============================================================================
 * Vertex Shader
 * ========================================================================== */

export const vertexSource = `
#define PI ${Math.PI}
#define PI_2 ${Math.PI * 2}

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

    // Updates the x-position based on y after transforms have been applied
    if (uCheckbox == true) {
        projectedPosition.x += sin(
            (projectedPosition.y / 2.0 + 0.5) * PI_2
        );
    }

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
#define PI ${Math.PI}
#define PI_2 ${Math.PI * 2}

precision mediump float;

uniform float uSlider0;         // Value from -1.0 to 1.0
uniform float uSlider1;         // Value from  0.0 to 1.0
uniform float uSlider2;         // Value from  0.0 to 1.0
uniform sampler2D uTexture0;    // First input texture
uniform sampler2D uTexture1;    // Second input texture

varying vec4 vColor;
varying vec3 vNormal;
varying vec2 vUv;

void main(void) {
    // Intensity of wave effect
    float waveAmount = sin(vUv.y * PI_2) / 3.0 * uSlider0;

    // Amount of shadow
    float shadowValue = dot(
        normalize(vNormal),
        normalize(vec3(0.0, 0.0, 1.0))
    );

    // First texture value
    // Updating the UV with waveAmount applies the wave effect
    vec4 tex0 = texture2D(
        uTexture0,
        vec2(
            vUv.x + waveAmount,
            vUv.y
        )
    );

    // Second texture value
    vec4 tex1 = texture2D(uTexture1, vUv);

    // Set the final color to tex0
    gl_FragColor = tex0;

    // Switch to tex1 based on the slider
    if (tex0.r <= uSlider1) {
        gl_FragColor = tex1;
    }

    // Blend the texture color with the vertex color
    gl_FragColor = mix(
        gl_FragColor,
        vColor,
        0.1
    );

    // Multiply by the shadowValue to apply shading to faces not towards camera
    gl_FragColor.rgb *= vec3(max(0.2, shadowValue / 2.0 + 0.5));

    // Discard pixels based on the slider
    if (1.0 - tex0.g <= uSlider2) {
        discard;
    }
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
