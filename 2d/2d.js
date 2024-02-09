import { vertexData } from '../data/quad.js'
import { createShaderProgram } from '../webgl-helpers.js'
import { vertexSource, fragmentSource } from '../shaders/distortion.glsl.js'

const canvas =          document.getElementById('canvas')
const imageInput =      document.getElementById('imageInput')
const videoInput =      document.getElementById('videoInput')
const waveAmtXInput =   document.getElementById('waveAmtXInput')
const waveAmtYInput =   document.getElementById('waveAmtYInput')
const waveCountXInput = document.getElementById('waveCountXInput')
const waveCountYInput = document.getElementById('waveCountYInput')
const resetButton     = document.getElementById('resetButton')
const interleaveInput = document.getElementById('interleaveInput')

waveAmtXInput.dataset.default = waveAmtXInput.value
waveAmtYInput.dataset.default = waveAmtYInput.value
waveCountXInput.dataset.default = waveCountXInput.value
waveCountYInput.dataset.default = waveCountYInput.value

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

const vbo = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, vbo)

// vertData imported from /data/quad.js
gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW)

// To access an attribute from one of our shaders, we need it's location.
const positionLoc =     gl.getAttribLocation(program, 'position')

// Similarly, to access a uniform we need it's location.
const textureLoc =      gl.getUniformLocation(program, 'texture')
const textureSizeLoc =  gl.getUniformLocation(program, 'textureSize')
const waveAmtLoc =      gl.getUniformLocation(program, 'waveAmt')
const waveCountLoc =    gl.getUniformLocation(program, 'waveCount')
const interleaveLoc =   gl.getUniformLocation(program, 'interleave')

gl.enableVertexAttribArray(positionLoc)

gl.vertexAttribPointer(
  positionLoc,  // Attribute location to bind data to
  2,            // Number of components per vertex (2, because we're using only X and Y)
  gl.FLOAT,     // The type of each value
  false,        // Ignored for gl.FLOAT
  0,            // Stride (not important here)
  0             // Offset (not important here)
)

const texture = gl.createTexture()
gl.bindTexture(gl.TEXTURE_2D, texture)
gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)


// Set listeners ---------------------------------------------------------------

imageInput.addEventListener('change', setImageTexture)
videoInput.addEventListener('change', setVideoTexture)
waveAmtXInput.addEventListener('input', setWaveValue)
waveAmtYInput.addEventListener('input', setWaveValue)
waveCountXInput.addEventListener('input', setWaveCount)
waveCountYInput.addEventListener('input', setWaveCount)
resetButton.addEventListener('click', resetWaves)
interleaveInput.addEventListener('change', setInterleave)


// Run program -----------------------------------------------------------------

setWaveValue()
setWaveCount()
setInterleave()
draw()


// Functions -------------------------------------------------------------------

function draw() {
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)
}

function setImageTexture(event) {
  const image = new Image()
  const fr = new FileReader()

  image.addEventListener('load', () => {
    canvas.width = image.width
    canvas.height = image.height

    // Reset the viewport
    gl.viewport(0, 0, canvas.width, canvas.height)

    gl.uniform2f(textureSizeLoc, image.width, image.height)

    gl.texImage2D(
      gl.TEXTURE_2D,    // Type of texture
      0,                // Level of detail
      gl.RGB,           // Internal format (how pixel data is stored in the image)
      gl.RGB,           // *handwavey motions*
      gl.UNSIGNED_BYTE, // Type...relates to the two values above
      image             // Pixel data:
    )

    draw()
  })

  fr.addEventListener('load', (frEvent) => {
    image.src = frEvent.target.result
  })

  fr.readAsDataURL(event.target.files[0])
}

function setVideoTexture() {
  const video = document.createElement('video')
  video.setAttribute('autoplay', true)
  video.setAttribute('muted', true)
  video.setAttribute('loop', true)
  video.setAttribute('playsinline', true)

  const fr = new FileReader()

  video.addEventListener('canplaythrough', () => {
    video.play()
    video.requestVideoFrameCallback(processFrame)
  })

  fr.addEventListener('load', (frEvent) => {
    video.src = frEvent.target.result
    video.load()
  })

  fr.readAsDataURL(event.target.files[0])

  function processFrame() {
    video.requestVideoFrameCallback(processFrame)

    gl.texImage2D(
      gl.TEXTURE_2D,    // Type of texture
      0,                // Level of detail
      gl.RGB,           // Internal format (how pixel data is stored in the image)
      gl.RGB,           // *handwavey motions*
      gl.UNSIGNED_BYTE, // Type...relates to the two values above
      video             // Pixel data:
    )

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Reset the viewport
    gl.viewport(0, 0, canvas.width, canvas.height)

    gl.uniform2f(textureSizeLoc, video.videoWidth, video.videoHeight)

    draw()
  }
}

function setWaveValue() {
  gl.uniform2f(waveAmtLoc, waveAmtXInput.value, waveAmtYInput.value)

  draw()
}

function setWaveCount() {
  gl.uniform2f(waveCountLoc, waveCountXInput.value, waveCountYInput.value)

  draw()
}

function resetWaves() {
  waveAmtXInput.value = waveAmtXInput.dataset.default
  waveAmtYInput.value = waveAmtYInput.dataset.default
  waveCountXInput.value = waveCountXInput.dataset.default
  waveCountYInput.value = waveCountYInput.dataset.default

  setWaveValue()
  setWaveCount()
}

function setInterleave() {
  gl.uniform1i(interleaveLoc, interleaveInput.checked)

  draw()
}
