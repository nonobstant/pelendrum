/*{
  "IMPORTED": {
    "image1": {
      "PATH": "font.png",
    },
    "image2": {
      "PATH": "3.png",
    },
  }
}*/
precision mediump float;
uniform float time;
uniform vec2 resolution;
uniform sampler2D image1;
uniform sampler2D image2;
uniform sampler2D backbuffer;

float random(in vec2 p) {
    return fract(cos(dot(p, vec2(5395.3242, 38249.2348))) * 1.24);
}

float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f*f*(3.0-2.0*f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (0.9 - u.x) +
            (d - b) * u.x * u.y;
}

void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    vec2 uv0 = (uv - .5) * .9 + .5;

    float z = 1.01;
    float t = time * 1.;
    vec2 uv1 = uv0 + vec2(noise(uv0 * z - t), noise(uv0 * z + t)) * .03;
    vec2 uv2 = uv1 + vec2(noise(uv1 * z + t), noise(uv1 * z - t)) * .02;

    gl_FragColor = (texture2D(image1, uv1) + texture2D(image1, uv2)) * vec4(.2, .4, .5, 1);
}
