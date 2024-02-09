// Everything passed as a vertex attribute is stored in a flat TypedArray. When
// it is passed to the shader program, we tell it how to unpack the array into
// meaningful chunks of data.
//
// Example 1: To send X and Y coordinates for 3 vertices we would need an array
// of length 6, where each set of 2 values was the X and Y for a single vertex:
// [ x0, y0, x1, y1, x2, y2 ]
//
// Example 2: To send RGB values for 3 vertices we'd need an array of length 9,
// with each set of 3 values representing R, G and B for that vertex:
// [ r0, g0, b0, r1, g1, b1, r2, g2, b2 ]
//
// This is true for any data we pass as vertex attribute data, but the number of
// values per vertex must either be 1, 2, 3, or 4, and it must be consistent for
// all data, so you could *not* have:
// [ x0, y0, x1, y1, z1, x2, x3, y3 ]  <-- BAD

// A cube is made of 6 faces. Each face is a square with 4 vertices (corners).
// Because this is in 3D, each vertex needs and X, Y and Z value. So the number
// of values in this array is:
export const vertexData = new Float32Array([
  // Front face
  -1.0, -1.0,  1.0,
   1.0, -1.0,  1.0,
   1.0,  1.0,  1.0,
  -1.0,  1.0,  1.0,

  // Back face
  -1.0, -1.0, -1.0,
  -1.0,  1.0, -1.0,
   1.0,  1.0, -1.0,
   1.0, -1.0, -1.0,

  // Top face
  -1.0,  1.0, -1.0,
  -1.0,  1.0,  1.0,
   1.0,  1.0,  1.0,
   1.0,  1.0, -1.0,

  // Bottom face
  -1.0, -1.0, -1.0,
   1.0, -1.0, -1.0,
   1.0, -1.0,  1.0,
  -1.0, -1.0,  1.0,

  // Right face
   1.0, -1.0, -1.0,
   1.0,  1.0, -1.0,
   1.0,  1.0,  1.0,
   1.0, -1.0,  1.0,

  // Left face
  -1.0, -1.0, -1.0,
  -1.0, -1.0,  1.0,
  -1.0,  1.0,  1.0,
  -1.0,  1.0, -1.0,
])

// Colors are stored as RGBA (red, green, blue, alpha) so we need 4 values per
// vertex. We want each face of the cube to have a solid color, so we'll define
// each color once, repeat it 4 times to cover the four vertices of the face,
// and then flatten the array.
export const colorData = new Float32Array([
  // Front face - red
  [1.0, 0.0, 0.0, 1.0],

  // Back face - green
  [0.0, 1.0, 0.0, 1.0],

  // Top face - blue
  [0.0, 0.0, 1.0, 1.0],

  // Bottom face - yellow
  [1.0, 1.0, 0.0, 1.0],

  // Right face - purple
  [1.0, 0.0, 1.0, 1.0],

  // Left face - orange
  [0.0, 1.0, 1.0, 1.0],
].map(n => {
  return [].concat(n, n, n, n)
}).flat())

// Normals are an XYZ vector that tells the shader the direction that is
// perpendicularly "out" from a face. Similar to the colors, since we want to
// repeat the value for each vertex on a face, we start with a 2D array,
// duplicate values, then flatten.
export const normalData = new Float32Array([
  // Front face
  [ 0.0,  0.0,  1.0],

  // Back face
  [ 0.0,  0.0, -1.0],

  // Top face
  [ 0.0,  1.0,  0.0],

  // Bottom face
  [ 0.0, -1.0,  0.0],

  // Right face
  [ 1.0,  0.0,  0.0],

  // Left face
  [-1.0,  0.0,  0.0],
].map(n => {
  return [].concat(n, n, n, n)
}).flat())


// UVs map a vertex to a point on a texture. They are how textures wrap around
// 3D objects. For each vertex, you map an X and Y coordinate for an image, in a
// 0 to 1 coordinate system.
export const uvData = new Float32Array(Array(6).fill([
  0.0, 0.0,
  1.0, 0.0,
  1.0, 1.0,
  0.0, 1.0,
]).flat())

// The vertices we've defined need to be arranged into triangles. Each cube face
// will be made up of two triangles, which means we'll use 6 values per cube
// face.
export const vertexIndices = new Uint16Array([
   0,  1,  2,  0,  2,  3, // front
   4,  5,  6,  4,  6,  7, // back
   8,  9, 10,  8, 10, 11, // top
  12, 13, 14, 12, 14, 15, // bottom
  16, 17, 18, 16, 18, 19, // right
  20, 21, 22, 20, 22, 23, // left
])

// NOTE:
// I've separated all of these into separate arrays, but it's possible to
// combine them into a single array as well. In that case, we might have
// something like this:
// [
//    x0, y0, z0, r0, g0, b0, a0...
//    x1, y1, z1, r1, g1, b1, a1...
//    x2, y2, z2, r2, g2, b2, a2...
// ]
// Then in the main file, when calling gl.vertexAttribPointer, you would use the
// stride and offset parameters to specify how many bytes each attribute takes
// up and how many bytes to skip. For the above, to pass position and color:
//    Position:
//      Stride - 3 * bytesPerComponent    (3 values)
//      Offset - 0 * bytesPerComponent    (no offset because it's the beginning of the array)
//    Color:
//      Stride - 4 * bytesPerComponent    (4 values)
//      Offset - 3 * bytesPerComponent    (skip the 3 position values)
