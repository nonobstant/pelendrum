    precision mediump float;
    uniform vec2 resolution;
		uniform float time;

		void main(){
			vec2 uv = gl_FragCoord.xy / resolution.xy; // 0 <>  1

			gl_FragColor = vec4(time , uv , 1.0);
		}
