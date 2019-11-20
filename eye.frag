    precision mediump float;
    uniform vec2 resolution;
		uniform float time;

		#define PI 3.14159265359
		#define TWO_PI 6.28318530718
		#define OFFSET 43758.5453123

		mat2 rotate2d(float _angle){
			return mat2(cos(_angle),-sin(_angle),
						sin(_angle),cos(_angle));
		}

		vec2 rotateFrom(vec2 uv, vec2 center, float angle){
			vec2 uv_ = uv - center;
			uv_ =  rotate2d(angle) * uv_;
			uv_ = uv_ + center;

			return uv_;
		}

		float random(float value){
			return fract(sin(value) * OFFSET);
		}

		float random(vec2 tex){
			return fract(sin(dot(tex.xy, vec2(12.9898, 78.233))) * OFFSET);
		}

		vec2 random2D(vec2 uv){
			uv = vec2(dot(uv, vec2(127.1, 311.7)), dot(uv, vec2(269.5, 183.3)));
			return -1.0 + 2.0 * fract(sin(uv) * OFFSET);
		}

		vec3 random3D(vec3 uv){
			uv = vec3(dot(uv, vec3(127.1, 311.7, 120.9898)), dot(uv, vec3(269.5, 183.3, 150.457)), dot(uv, vec3(380.5, 182.3, 170.457)));
			return -1.0 + 2.0 * fract(sin(uv) * OFFSET);
		}

		float cubicCurve(float value){
			return value * value * (3.0 - 2.0 * value); // custom cubic curve
		}

		vec2 cubicCurve(vec2 value){
			return value * value * (3.0 - 2.0 * value); // custom cubic curve
		}

		vec3 cubicCurve(vec3 value){
			return value * value * (3.0 - 2.0 * value); // custom cubic curve
		}

		float noise(vec2 uv){
			vec2 iuv = floor(uv);
			vec2 fuv = fract(uv);
			vec2 suv = cubicCurve(fuv);

			float dotAA_ = dot(random2D(iuv + vec2(0.0)), fuv - vec2(0.0));
			float dotBB_ = dot(random2D(iuv + vec2(1.0, 1.0)), fuv - vec2(1.0, 1.0));
			float dotCC_ = dot(random2D(iuv + vec2(0.0, 1.0)), fuv - vec2(0.0, 1.0));
			float dotDD_ = dot(random2D(iuv + vec2(1.0, 1.0)), fuv - vec2(1.0, 1.0));

			return mix(
				mix(dotAA_, dotBB_,	suv.x),
				mix(dotCC_, dotDD_, suv.x),
				suv.y);
		}

		float noise(vec3 uv){
			vec3 iuv = floor(uv);
			vec3 fuv = fract(uv);
			vec3 suv = cubicCurve(fuv);

			float dotAA_ = dot(random3D(iuv + vec3(0.0)), fuv - vec3(0.0));
			float dotBB_ = dot(random3D(iuv + vec3(1.0, 0.0, 0.0)), fuv - vec3(1.0, 0.0, 0.0));
			float dotCC_ = dot(random3D(iuv + vec3(0.0, 1.0, 0.0)), fuv - vec3(0.0, 1.0, 0.0));
			float dotDD_ = dot(random3D(iuv + vec3(1.0, 1.0, 0.0)), fuv - vec3(1.0, 1.0, 0.0));

			float dotEE_ = dot(random3D(iuv + vec3(0.0, 0.0, 1.0)), fuv - vec3(0.0, 0.0, 1.0));
			float dotFF_ = dot(random3D(iuv + vec3(1.0, 0.0, 1.0)), fuv - vec3(1.0, 0.0, 1.0));
			float dotGG_ = dot(random3D(iuv + vec3(0.0, 1.0, 1.0)), fuv - vec3(0.0, 1.0, 1.0));
			float dotHH_ = dot(random3D(iuv + vec3(1.0, 1.0, 1.0)), fuv - vec3(1.0, 1.0, 1.0));

			float passH0 = mix(
				mix(dotAA_, dotBB_,	suv.x),
				mix(dotCC_, dotDD_, suv.x),
				suv.y);

			float passH1 = mix(
				mix(dotEE_, dotFF_,	suv.x),
				mix(dotGG_, dotHH_, suv.x),
				suv.y);

			return mix(passH0, passH1, suv.z);
		}

		vec2 lensDistort(vec2 uv, float power, float radInc)
		{
			float theta  = atan(uv.y, uv.x);
			float radius = length(uv);
			radius = pow(radius, power) * radInc;
			uv.x = radius * cos(theta);
			uv.y = radius * sin(theta);
			return 0.5 * (uv + 1.0);
		}

		float getAngle(vec2 uv){
			return atan(uv.y, uv.x) + TWO_PI * 0.5;
		}

		float getNormalAngle(vec2 uv){
			float theta = getAngle(uv);
			theta = mod(theta, TWO_PI) / TWO_PI;
			return theta;
		}

		float remap010(float value){
			//remap from 0 → 1 to 1 → 0 → 1
			return 1.0 - abs(value * 2.0 - 1.0);
		}

		float circle(vec2 uv, vec2 center, float radius, float smooth, float thickness){
				float len = length(center - uv);
				float edge1 = 1.0 - smoothstep(radius - smooth * 0.5, radius + smooth * 1.5, len);
				float edge2 = smoothstep(radius - thickness - smooth * 0.5, radius - thickness + smooth * 0.5, len);

				return edge1 * edge2;
		}

		vec2 remapToSquareUV(vec2 uv, float res){
			uv.y /= res;

			return uv - vec2(0.0, (1.0 - res) * 0.5);
		}

		vec3 hsv2rgb(vec3 c)
		{
			vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 2.0);
			vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
			return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
		}

		vec4 addGrain(vec2 uv, float time, float grainIntensity){
    		float grain = random(fract(uv * time)) * grainIntensity;
    		return vec4(vec3(grain), 1.0);
		}

		void main(){
			vec2 uv = gl_FragCoord.xy / resolution.xy;
			vec2 ouv = uv;
			uv = remapToSquareUV(uv, resolution.x/resolution.y);

			//distort lens
			float noiseBulk = noise(vec3(time)) * 2.0 - 1.0;
			uv = lensDistort(uv * 2.0 - 1.0, 2.0 - noiseBulk * 0.75, 1.0);

			//main rotation
			float alpha =  (noise(vec3(time * 0.001)) * 2.0 - 1.0) * TWO_PI;
			uv = rotateFrom(uv, vec2(0.5), alpha);

			//main deformation
			float deformInc = 1.0;
			float betaInc = 0.1;
			for(int i=0; i<2; i++){
				float beta =  noise(vec3((uv * 2.0 - 1.0) * deformInc, time * 0.1)) * TWO_PI;
				beta = sin(beta) * betaInc;
				uv = rotateFrom(uv, vec2(0.5), beta);
				deformInc += 10.0;
				betaInc -= 0.09;
			}


			vec2 center = vec2(0.5);
			vec2 uvc = center - uv;
			float eta = getNormalAngle(uvc);

			float numberOfLine = 0.5;
			float modEta = mod(eta , numberOfLine) / numberOfLine;
			//remap between 0 1 0;
			float theta = remap010(modEta);


			float centerHue = noise(vec3(ouv * theta + uv, time * 0.1)) * 0.15 + 0.85;
			float outsideHue = noise(vec3(ouv * 2.0 * theta * uv, uv.x * uv.y + time * 0.5)) * (0.2) + 0.6;
			vec3 centerColor = hsv2rgb(vec3(centerHue, 1.0, 1.0));
			vec3 outsideColor = hsv2rgb(vec3(outsideHue, 0.75, 1.0));

			numberOfLine = 0.0065;
			modEta = mod(eta , numberOfLine) / numberOfLine;
			//remap between 0 1 0;
			theta = remap010(modEta);

			//iris animation
			float randIris = random(modEta);
			float minIris = 1.4;
			float maxIris = 0.001;
			float irisSpeed = 0.5;
			float timeIris = noise(vec3(uv * 20.0, time * irisSpeed));
			float irisAnimation = minIris + sin(time * irisSpeed) * maxIris + noise(vec3(time)) * 0.1 + randIris * 0.02;
			float circ = circle(uv, center, 1.5, 0.05, irisAnimation);


			float randShadowIris = random(modEta);
			float minShadowIris = 0.9;
			float maxShadowIris = 0.4;
			float irisShadowSpeed = 0.5;
			float timeShadowIris = noise(vec3(uv * 2.0, time * irisShadowSpeed));
			float irisShadowAnimation = random(timeShadowIris) * 0.05;
			float circShadow = circle(uv, center, minShadowIris + irisShadowAnimation, 0.1, maxShadowIris);


			float randNoiseShadowIris = random(modEta);
			float irisNoiseShadowSpeed = 1.5;
			float timeNoiseShadowIris = noise(vec3(uv * 10.0, time * irisNoiseShadowSpeed));
			float circNoiseShadow = circle(uv, center, 1.0 - timeNoiseShadowIris, 0.5, 1.0 + timeNoiseShadowIris);

			//eye lines
			float line = 0.0;

			float thick = 0.3;
			float thickSpeed = 1.0;
			float noiseThick = noise(vec3(uv * 10.0, time * thickSpeed));
			noiseThick = clamp(noiseThick, 0.0, 1.0);
			float randThick = random(modEta + time) * 0.15;
			float thickline = 1.0 - smoothstep(0.0, thick + randThick + noiseThick, theta);

			//subLine
			float numberOfSubLine = 0.5;
			float modGamma = mod(eta, numberOfSubLine) / numberOfSubLine;
			//remap between 0 1 0;
			float gamma = remap010(modGamma);

			float subThick = 0.5;
			float subThickSpeed = 1.0;
			float noiseSubThick = noise(vec3(uv * 10.0, time * subThickSpeed));
			noiseSubThick = clamp(noiseSubThick, 0.0, 1.0);
			float randSubThick = random(modGamma + time) * 0.15;
			float subThickline = 1.0 - smoothstep(0.0, subThick + randSubThick + noiseSubThick, gamma);


			line += thickline;
			line += subThickline;
			line *= circ;
			float oline = line * circ;
			line *= (0.5 - circShadow * 0.5);
			line *= (1.0 - circNoiseShadow * 0.65);

			float dist = length(vec2(0.5) - uv) * 0.5;
			dist = 1.0 - smoothstep(0.25, 0.5, dist);
			line *= dist;

			float lights = clamp(circNoiseShadow, 0.0, 0.5);

			vec3 color = mix(centerColor, outsideColor, dist) * line;
			vec3 colorlight = pow(color, vec3(lights * 1.5)) * circ * dist;
			colorlight = clamp(color, vec3(0.0), vec3(1.0));

			vec4 grain = addGrain(ouv, time, 0.1);



			gl_FragColor = vec4(color + color * colorlight * 0.5, 1.0) + grain;
		}
