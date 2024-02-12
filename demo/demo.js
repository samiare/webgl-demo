import {
  vertexData,
  colorData,
  normalData,
  vertexIndices,
  uvData
} from '../data/cube.js'
import { createShaderProgram, createTexture } from '../webgl-helpers.js'
import { vertexSource, fragmentSource } from '../shaders/demo.glsl.js'

const canvas   = document.getElementById('canvas')
const input0   = document.getElementById('input0')
const input1   = document.getElementById('input1')
const input2   = document.getElementById('input2')
const checkbox = document.getElementById('checkbox')

let rotation = 0.0
let deltaTime = 0
let previousTime = 0


// Set listeners ---------------------------------------------------------------

input0?.addEventListener('input', setProgress)
input1?.addEventListener('input', setProgress)
input2?.addEventListener('input', setProgress)
checkbox?.addEventListener('change', setCheckbox)


// Set up WebGL ----------------------------------------------------------------

// The WebGL context of the canvas is what we use to access all WebGL APIs
const gl = canvas.getContext('webgl', {
  antialias: true,
  //preserveDrawingBuffer: true
})

// A WebGLProgram is what is typically called a "material" in other 3D systems.
// It contains a vertex and fragment shader pair that define the appearance of
// objects in the scene.
const program = createShaderProgram(gl, vertexSource, fragmentSource)

// This step takes the variables we set up in the shaders (uniforms, attributes,
// varyings) and assigns them a location in memory that we can access.
gl.linkProgram(program)

// Tell WebGL which program to use. A complex scene with multiple objects will
// have many programs. To render each object correctly, you need to call
// useProgram before calling drawElements or drawArrays.
gl.useProgram(program)

// This can be skipped because it is set to the size of the canvas element when
// the WebGLContext is created but needs to be manually updated when the
// viewport resizes, or if you want to set a size different from the pixel
// dimensions of the canvas.
gl.viewport(
  0,              // Horizontal coord of the lower left corner of viewport
  0,              // Vertical coord of the lower left corner of viewport
  canvas.width,   // Width of the viewport
  canvas.height   // Height of the viewport
)


// Prepare data ----------------------------------------------------------------

// To set values for uniforms and attributes in shaders, you need to get their
// "location", which acts like a reference to where that data is stored to send
// it to the GPU.

const positionLoc         = gl.getAttribLocation(program, 'position')
const colorLoc            = gl.getAttribLocation(program, 'color')
const normalLoc           = gl.getAttribLocation(program, 'normal')
const uvLoc               = gl.getAttribLocation(program, 'uv')

const projectionMatrixLoc = gl.getUniformLocation(program, 'uProjectionMatrix')
const modelViewMatrixLoc  = gl.getUniformLocation(program, 'uModelViewMatrix')
const slider0Loc          = gl.getUniformLocation(program, 'uSlider0')
const slider1Loc          = gl.getUniformLocation(program, 'uSlider1')
const slider2Loc          = gl.getUniformLocation(program, 'uSlider2')
const checkboxLoc         = gl.getUniformLocation(program, 'uCheckbox')
const texture0Loc         = gl.getUniformLocation(program, 'uTexture0')
const texture1Loc         = gl.getUniformLocation(program, 'uTexture1')

// To send attribute data you have to go through a few steps.
// 1. Create a buffer object
// 2. Bind that buffer object to one of WebGL's binding targets - either
//    ARRAY_BUFFER (for vertex data) or ELEMENT_ARRAY_BUFFER
// 3. Pass the data to the buffer target
// 4. Tell WebGL how to interpret that data
// 5. Enable the data

// Sends position data
const positionBuffer = gl.createBuffer()                    // 1
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)              // 2
gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW)  // 3
gl.vertexAttribPointer(                                     // 4
  positionLoc,  // Attribute location to bind data to
  3,            // Number of components per vertex
  gl.FLOAT,     // The type of each value
  false,        // Ignored for gl.FLOAT
  0,            // Stride (not important here)
  0             // Offset (not important here)
)
gl.enableVertexAttribArray(positionLoc)                     // 5

// Sends color data
const colorBuffer = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
gl.bufferData(gl.ARRAY_BUFFER, colorData, gl.STATIC_DRAW)
gl.vertexAttribPointer(
  colorLoc,     // Attribute location to bind data to
  4,            // Number of components per vertex
  gl.FLOAT,     // The type of each value
  false,        // Ignored for gl.FLOAT
  0,            // Stride (not important here)
  0             // Offset (not important here)
)
gl.enableVertexAttribArray(colorLoc)

// Sends normal data
const normalBuffer = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer)
gl.bufferData(gl.ARRAY_BUFFER, normalData, gl.STATIC_DRAW)
gl.vertexAttribPointer(
  normalLoc,    // Attribute location to bind data to
  3,            // Number of components per vertex
  gl.FLOAT,     // The type of each value
  false,        // Ignored for gl.FLOAT
  0,            // Stride (not important here)
  0             // Offset (not important here)
)
gl.enableVertexAttribArray(normalLoc)

// Sends UV data
const uvBuffer = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer)
gl.bufferData(gl.ARRAY_BUFFER, uvData, gl.STATIC_DRAW)
gl.vertexAttribPointer(
  uvLoc,        // Attribute location to bind data to
  2,            // Number of components per vertex
  gl.FLOAT,     // The type of each value
  false,        // Ignored for gl.FLOAT
  0,            // Stride (not important here)
  0             // Offset (not important here)
)
gl.enableVertexAttribArray(uvLoc)


const indexBuffer = gl.createBuffer()
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, vertexIndices, gl.STATIC_DRAW)

// Sending Uniform data is a little simpler. You call the version of
// gl.uniform[1234][fi][v]() that matches the type of data you want to send:
//  - [1234] is the number of components, 1 for a scalar and 2–4 for vectors
//  - [fi] for float or int
//  - Adding [v] lets you pass one single array instead of multple args
// Ex: gl.uniform1i(location, 3)
//     gl.uniform3f(location, 1.0, 0.3, 5.75)
//     gl.uniform4iv(location, [1, 2, 3, 4])
if (input0) gl.uniform1f(slider0Loc, input0.value)
if (input1) gl.uniform1f(slider1Loc, input1.value)
if (input2) gl.uniform1f(slider2Loc, input2.value)
if (checkbox) gl.uniform1i(checkboxLoc, checkbox.checked)

// Sending texture uniforms is a little more involved so it's broken out into
// a helper function. Each WebGL implementation can handle a specific number of
// textures per program (no fewer than 8). You have to specify the index of the
// texture unit you're working with. You use gl.uniform1i, and the data you pass
// to it is the index of that texture, rather than the texture itself.
const texture0 = createTexture(gl, 0, '../assets/feathers.png')
gl.uniform1i(texture0Loc, 0)

const texture1 = createTexture(gl, 1, '../assets/bricks.png')
gl.uniform1i(texture1Loc, 1)


// Run program -----------------------------------------------------------------

requestAnimationFrame(draw)


// Functions -------------------------------------------------------------------

function draw(now) {
  requestAnimationFrame(draw)

  // Sets the color that will be used when the color buffer is cleared
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clearDepth(1.0)
  gl.enable(gl.DEPTH_TEST)
  gl.depthFunc(gl.LEQUAL)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  now /= 1000
  deltaTime = now - previousTime
  previousTime = now
  rotation += deltaTime
  //rotation = 1.5

  const projectionMatrix = mat4.create()
  const modelViewMatrix = mat4.create()

  // Matrices are used to transform vectors. We can do operations like moving or
  // rotating an object by applying a transform to a matrix, sending that matrix
  // to our vertex shader, and applying that matrix to a vertex position.

  // projectionMatrix represents the camera into our scene. We apply some
  // perpsective settings here to render the scene with perspective.
  mat4.perspective(
    projectionMatrix,
    (45 * Math.PI) / 180,                           // Field of view
    gl.canvas.clientWidth / gl.canvas.clientHeight, // Aspect ratio
    0.1,                                            // z-space near clipping
    100.0                                           // z-space far clipping
  )

  // Move backwards in z-space
  mat4.translate(
    projectionMatrix,
    projectionMatrix,
    [-0.0, 0.0, -6.0]
  )

  // modelViewMatrix is the position of our cube. We can translate and rotate it
  // here, similar to CSS transforms.

  // Rotate around Z axis
  mat4.rotate(
    modelViewMatrix,
    modelViewMatrix,
    rotation * 0.1,
    [0, 0, 1]
  )

  // Rotate around Y axis
  mat4.rotate(
    modelViewMatrix,
    modelViewMatrix,
    rotation * 0.35,
    [0, 1, 0]
  )

  // Rotate around X axis
  mat4.rotate(
    modelViewMatrix,
    modelViewMatrix,
    rotation * 0.25,
    [1, 0, 0]
  )

  // Send both matrices to our shaders. The second value is always false, for
  // reasons I don't know :shrug:
  gl.uniformMatrix4fv(projectionMatrixLoc, false, projectionMatrix)
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, modelViewMatrix)

  // Finally, this tells WebGL how to render the data stored in ARRAY_BUFFER.
  // Calling drawElements tells it to use ELEMENT_ARRAY_BUFFER to know what
  // order to draw the vertices in, and gl.TRIANGLES tells it to render as
  // individual triangles.
  gl.drawElements(
    gl.TRIANGLES,
    36,
    gl.UNSIGNED_SHORT,
    0
  )
}

function setProgress() {
  if (input0) gl.uniform1f(slider0Loc, input0.value)
  if (input1) gl.uniform1f(slider1Loc, input1.value)
  if (input2) gl.uniform1f(slider2Loc, input2.value)
}

function setCheckbox() {
  if (checkbox) gl.uniform1i(checkboxLoc, checkbox.checked)
}
