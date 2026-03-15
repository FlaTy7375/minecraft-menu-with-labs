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

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
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
  float t = clamp(dir.y * 1.5 + 0.3, 0.0, 1.0);

  vec3 bottom = vec3(0.35, 0.02, 0.0);
  vec3 mid    = vec3(0.18, 0.01, 0.0);
  vec3 top    = vec3(0.06, 0.0,  0.0);
  vec3 col = mix(bottom, mix(mid, top, t), t);

  // Огненные всполохи
  float yy = max(abs(dir.y), 0.05);
  vec2 uv = dir.xz / yy;
  float fire = fbm(uv * 0.6 + vec2(uTime * 0.05, uTime * 0.03));
  float fireMask = smoothstep(0.55, 0.75, fire) * smoothstep(-0.1, 0.3, dir.y) * (1.0 - smoothstep(0.3, 0.7, dir.y));
  col += fireMask * vec3(0.6, 0.15, 0.0) * 0.8;

  // Лавовое свечение у горизонта
  float horizon = smoothstep(0.0, 0.12, dir.y) * (1.0 - smoothstep(0.12, 0.35, dir.y));
  col += horizon * vec3(0.5, 0.08, 0.0) * 0.6;

  gl_FragColor = vec4(col, 1.0);
}
`

export function NetherSky() {
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
