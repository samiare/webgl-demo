export const vertexSource = `
attribute vec2 position;

void main(void) {
    gl_Position = vec4(position, 0.0, 1.0);
}
`

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
    //gl_FragColor = vec4(
    //    (sin(texPos.y * PI_2 * waveCount.x) + 1.0) / 2.0,
    //    0.0,
    //    (sin(texPos.x * PI_2 * waveCount.y) + 1.0) / 2.0,
    //    1.0
    //);
}
`
