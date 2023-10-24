uniform float time;
varying vec2 vUv;
varying vec3 vPosition;
uniform vec2 pixels;
uniform vec3 uMin;
uniform float distancef;
float PI = 3.1415926;
void main () {


	vUv = (uv - vec2(.5)) * (.8 - 0.2 * distancef * (2. - distancef)) + vec2(.5);
	vec3 pos = position;
	pos.y += sin(PI * uv.x) * 0.01; 
	pos.z += sin(PI * uv.x) * 0.02; 

 
	pos.y += sin(time * .3) * 0.02;
	vUv.y -= sin(time * .3) * 0.02;

	gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}