# WebGL Demo

You must run a local webserver or you will get CORS errors. You can do this with `npx serve .` in the root directory.

---

`/2d`, `/3d`, `/demo` and `/demo-final` contain the HTML and main JS file for their respective demos.

`webgl-helpers.js` is a set of functions that helped clean up the other files.

The `/shaders` directory contains the GLSL shaders for each demo, while `/shaders/lib` contains helpers that can be imported into them.

`/assets` holds the test images and video used throughout.

`/data` holds two files, each with vertex data for a 3D cube and a 2D plane.

## Demos

### Demo

An unfinished version of **Demo [Final]**.

### Demo [Final]

Final version of **Demo** showing all of the techniques walked through in the live presentation.

### 2D - Image manipulation

Shows how to use WebGL for a 2D scene using an image or video as input. layers wavey effects on top of the input.

### 3D - Disintegration effect

Uses procedural textures to create an interactive disintegration effect.