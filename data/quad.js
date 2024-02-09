// Now we pass data to that buffer. We're going to pass 8 values, representing
// X and Y coordinates of the 4 vertices needed to create a rectangle covering
// the entire canvas. Even though this is a flat array, we will tell the program
// later to interpret it as pairs of values: [x, y, x, y, etc...].
export const vertexData = new Float32Array([
  -1,  1,
  -1, -1,
   1, -1,
   1,  1,
])
