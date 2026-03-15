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
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
}
float fbm(vec2 p) {
  return 0.5*noise(p) + 0.25*noise(p*2.0) + 0.125*noise(p*4.0) + 0.0625*noise(p*8.0);
}

void main() {
  vec3 dir = normalize(vWorldPos);
  float t = clamp(dir.y * 2.0, 0.0, 1.0);

  // Яркое голубое небо полдня
  vec3 skyHorizon = vec3(0.7, 0.88, 1.0);
  vec3 skyTop     = vec3(0.25, 0.55, 0.95);
  vec3 skyColor   = mix(skyHorizon, skyTop, t);

  // Редкие белые облака
  float yy = max(dir.y, 0.15);
  vec2 uv = (dir.xz / yy) * 0.6 + vec2(uTime * 0.008, 0.0);
  float cloud = fbm(uv);
  cloud = smoothstep(0.52, 0.68, cloud) * smoothstep(0.0, 0.2, dir.y);
  skyColor = mix(skyColor, vec3(1.0), cloud * 0.85);

  gl_FragColor = vec4(skyColor, 1.0);
}
`

export function DesertSky() {
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
