import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const vertexShader = `
varying vec3 vWorldPos;
void main() {
  vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const fragmentShader = `
varying vec3 vWorldPos;
uniform float uTime;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float noise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p);
  f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
}
float fbm(vec2 p) {
  return 0.5*noise(p)+0.25*noise(p*2.1)+0.125*noise(p*4.3)+0.0625*noise(p*8.7);
}

void main() {
  vec3 dir = normalize(vWorldPos);
  float t = clamp(dir.y * 2.0, 0.0, 1.0);

  // Голубовато-синее ночное небо
  vec3 skyBottom = vec3(0.05, 0.10, 0.22);
  vec3 skyTop    = vec3(0.02, 0.06, 0.18);
  vec3 skyColor  = mix(skyBottom, skyTop, t);

  // Звёзды — только в просветах между облаками (применяются ниже)
  vec2 uvStar = dir.xz / max(dir.y, 0.01);
  float star = hash(floor(uvStar * 90.0));
  float twinkle = 0.5 + 0.5 * sin(uTime * 2.0 + star * 6.28);
  star = step(0.994, star) * twinkle * smoothstep(0.1, 0.4, dir.y);

  // Луна
  vec3 moonDir = normalize(vec3(0.0, 0.55, -0.85));
  float moon = smoothstep(0.997, 1.0, dot(dir, moonDir));
  skyColor = mix(skyColor, vec3(0.92, 0.92, 0.80), moon);

  // Облака — тёмные тяжёлые как на скриншоте
  float yy = max(dir.y, 0.08);
  vec2 uvCloud = (dir.xz / yy) * 0.5 + vec2(uTime * 0.004, 0.0);
  float cloud = fbm(uvCloud);
  float cloudMask = smoothstep(0.45, 0.65, cloud) * smoothstep(0.0, 0.25, dir.y);
  // Облака тёмно-синие, чуть светлее неба
  vec3 cloudColor = vec3(0.08, 0.10, 0.18);
  skyColor = mix(skyColor, cloudColor, cloudMask * 0.85);
  // Убираем звёзды за облаками
  float starFinal = star * (1.0 - cloudMask);
  skyColor += vec3(starFinal * 0.85);
  // Clamp чтобы туман не давал чёрных артефактов
  skyColor = max(skyColor, vec3(0.02, 0.05, 0.15));

  gl_FragColor = vec4(skyColor, 1.0);
}
`

export function SnowSky() {
  const meshRef = useRef()
  useFrame(({ clock }) => {
    if (meshRef.current)
      meshRef.current.material.uniforms.uTime.value = clock.getElapsedTime()
  })
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[480, 24, 24]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{ uTime: { value: 0 } }}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  )
}
