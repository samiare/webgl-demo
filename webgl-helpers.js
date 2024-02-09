export function createShaderProgram(gl, vertSource, fragSource) {
  // A "program" contains a pair of valid vertex and fragment shaders
  const program = gl.createProgram()

  const vertShader = createShader(gl, gl.VERTEX_SHADER, vertSource)
  const fragShader = createShader(gl, gl.FRAGMENT_SHADER, fragSource)

  // Attach the shaders to the program
  gl.attachShader(program, vertShader)
  gl.attachShader(program, fragShader)

  return program
}

export function createShader(gl, type, source) {
  // 1. Create a shader object
  const shader = gl.createShader(type)

  // 2. Add the source code to the shader object
  gl.shaderSource(shader, source)

  // 3. Compile the shader, log errors
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader))
  }

  return shader
}

export function createTexture(gl, index, path) {
  if (index > gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS)) {
    console.warn(`Exceeded max number of textures: ${gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS)}`)
    return
  }

  const texture = gl.createTexture()
  const image = new Image()
  image.onload = () => {
    gl.activeTexture(gl[`TEXTURE${index}`])
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGB,
      gl.RGB,
      gl.UNSIGNED_BYTE,
      image
    )

    if (powerOfTwo(image.width) && powerOfTwo(image.height)) {
      // Yes, it's a power of 2. Generate mips.
      gl.generateMipmap(gl.TEXTURE_2D);
    } else {
      // No, it's not a power of 2. Turn off mips and set
      // wrapping to clamp to edge
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
  }
  image.src = path

  return texture
}

function powerOfTwo(x) {
  return (Math.log(x)/Math.log(2)) % 1 === 0;
}
