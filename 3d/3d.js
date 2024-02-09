import { vertexData, colorData, normalData, vertexIndices, uvData } from '../data/cube.js'
import { createShaderProgram, createTexture } from '../webgl-helpers.js'
import { vertexSource, fragmentSource } from '../shaders/disintegrate.glsl.js'

const canvas =          document.getElementById('canvas')
const progressInput =   document.getElementById('progressInput')

let rotation = 0.0
let deltaTime = 0
let previousTime = 0

const gl = canvas.getContext('webgl')

const program = createShaderProgram(gl, vertexSource, fragmentSource)

gl.linkProgram(program)

gl.useProgram(program)

gl.viewport(
  0,              // Horizontal coord of the lower left corner of viewport
  0,              // Vertical coord of the lower left corner of viewport
  canvas.width,   // Width of the viewport
  canvas.height   // Height of the viewport
)

const positionLoc = gl.getAttribLocation(program, 'position')
const colorLoc    = gl.getAttribLocation(program, 'color')
const normalLoc   = gl.getAttribLocation(program, 'normal')
const uvLoc       = gl.getAttribLocation(program, 'uv')

const projectionMatrixLoc = gl.getUniformLocation(program, 'uProjectionMatrix')
const modelViewMatrixLoc  = gl.getUniformLocation(program, 'uModelViewMatrix')
const timeLoc             = gl.getUniformLocation(program, 'uTime')
const progressLoc         = gl.getUniformLocation(program, 'uProgress')
const texture0Loc         = gl.getUniformLocation(program, 'uTexture0')
const texture1Loc         = gl.getUniformLocation(program, 'uTexture1')

const positionBuffer = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW)
gl.vertexAttribPointer(
  positionLoc,  // Attribute location to bind data to
  3,            // Number of components per vertex
  gl.FLOAT,     // The type of each value
  false,        // Ignored for gl.FLOAT
  0,            // Stride (not important here)
  0             // Offset (not important here)
)
gl.enableVertexAttribArray(positionLoc)

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


const texture0 = createTexture(gl, 0, '../assets/crate.jpg')
gl.uniform1i(texture0Loc, 0)

const texture1 = createTexture(gl, 1, '../assets/steel.png')
gl.uniform1i(texture1Loc, 1)



// Set listeners ---------------------------------------------------------------

if (progressInput) {
  progressInput.addEventListener('input', setProgress)
}


// Run program -----------------------------------------------------------------

requestAnimationFrame(draw)


// Functions -------------------------------------------------------------------

function draw(now) {
  requestAnimationFrame(draw)

  gl.clearColor(0.34, 0.50, 0.70, 1.0)
  gl.clearDepth(1.0)
  gl.enable(gl.DEPTH_TEST)
  gl.depthFunc(gl.LEQUAL)

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  now /= 1000
  deltaTime = now - previousTime
  previousTime = now
  rotation += deltaTime

  const projectionMatrix = mat4.create()
  const modelViewMatrix = mat4.create()

  mat4.perspective(
    projectionMatrix,
    (45 * Math.PI) / 180,                           // Field of view
    gl.canvas.clientWidth / gl.canvas.clientHeight, // Aspect ratio
    0.1,                                            // z-space near clipping
    100.0                                           // z-space far clipping
  )

  // Move backwards in z-space
  mat4.translate(
    modelViewMatrix,
    modelViewMatrix,
    [-0.0, 0.0, -6.0]
  )

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

  gl.uniformMatrix4fv(
    projectionMatrixLoc,
    false,
    projectionMatrix
  )

  gl.uniformMatrix4fv(
    modelViewMatrixLoc,
    false,
    modelViewMatrix
  )

  gl.uniform1f(timeLoc, now)

  gl.drawElements(
    gl.TRIANGLES,
    36,
    gl.UNSIGNED_SHORT,
    0
  )
}

function setProgress() {
  gl.uniform1f(progressLoc, progressInput.value)
}
