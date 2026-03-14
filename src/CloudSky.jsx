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
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  v += 0.5000 * noise(p);
  v += 0.2500 * noise(p * 2.0);
  v += 0.1250 * noise(p * 4.0);
  v += 0.0625 * noise(p * 8.0);
  return v;
}

void main() {
  vec3 dir = normalize(vWorldPos);

  float t = clamp(dir.y * 2.0, 0.0, 1.0);
  vec3 skyHorizon = vec3(1.0, 0.75, 0.45);
  vec3 skyMid     = vec3(0.75, 0.35, 0.45);
  vec3 skyTop     = vec3(0.55, 0.25, 0.45);  // светлее вверху
  vec3 skyColor   = mix(skyHorizon, mix(skyMid, skyTop, t), t);

  // Компенсируем растяжение — делим xz на y чтобы облака были одинакового размера
  float yy = max(dir.y, 0.15);
  vec2 uv = (dir.xz / yy) * 0.6 + vec2(uTime * 0.015, uTime * 0.005);

  float cloud = fbm(uv);
  cloud = smoothstep(0.40, 0.62, cloud);
  cloud *= smoothstep(0.0, 0.25, dir.y);

  vec3 cloudColor = mix(vec3(0.95, 0.7, 0.55), vec3(1.0, 0.9, 0.85), cloud);
  skyColor = mix(skyColor, cloudColor, cloud * 0.9);

  gl_FragColor = vec4(skyColor, 1.0);
}
`

export function CloudSky() {
  const meshRef = useRef()

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.material.uniforms.uTime.value = clock.getElapsedTime()
    }
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[480, 48, 48]} />
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
