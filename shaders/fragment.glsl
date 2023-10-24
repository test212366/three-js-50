uniform float time;
uniform float progress;
uniform sampler2D texture1;
uniform vec4 resolution;
varying vec2 vUv;
varying vec3 vPosition;
uniform float distancef;

float PI = 3.1415926;
void main() {

	
	vec4 t = texture2D(texture1, vUv);
	float bwt = (t.r + t.b + t.g) / 3.; 
	vec4 another = vec4(bwt,bwt,bwt, 1. );
	
	gl_FragColor = mix(another, t, distancef);
	gl_FragColor.a = clamp(distancef, 0.2, 1.);
}