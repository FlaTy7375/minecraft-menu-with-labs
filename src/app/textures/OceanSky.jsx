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

// Каустики — световые блики сквозь воду
float caustics(vec2 uv, float t) {
  float c = 0.0;
  c += noise(uv * 3.0 + vec2(t * 0.3, t * 0.2)) * 0.5;
  c += noise(uv * 6.0 - vec2(t * 0.2, t * 0.4)) * 0.3;
  c += noise(uv * 12.0 + vec2(t * 0.5, -t * 0.3)) * 0.2;
  return smoothstep(0.4, 0.8, c);
}

void main() {
  vec3 dir = normalize(vWorldPos);

  // Подводный градиент — темнее снизу, светлее сверху
  float t = clamp(dir.y * 1.5 + 0.5, 0.0, 1.0);
  vec3 deep   = vec3(0.01, 0.04, 0.12);
  vec3 mid    = vec3(0.02, 0.12, 0.30);
  vec3 surface = vec3(0.05, 0.25, 0.50);
  vec3 col = mix(deep, mix(mid, surface, t), t);

  // Каустики только сверху
  float yy = max(dir.y, 0.05);
  vec2 uv = dir.xz / yy;
  float c = caustics(uv * 0.4, uTime);
  col += c * 0.12 * smoothstep(0.0, 0.5, dir.y);

  // Лёгкое мерцание поверхности воды на горизонте
  float horizon = smoothstep(0.0, 0.15, dir.y) * (1.0 - smoothstep(0.15, 0.4, dir.y));
  col += horizon * vec3(0.1, 0.3, 0.5) * 0.4;

  gl_FragColor = vec4(col, 1.0);
}
`

export function OceanSky() {
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
