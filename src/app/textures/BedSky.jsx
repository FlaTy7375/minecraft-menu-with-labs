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
  return 0.5*noise(p)+0.25*noise(p*2.1)+0.125*noise(p*4.3);
}

void main() {
  vec3 dir = normalize(vWorldPos);
  float t = clamp(dir.y * 1.2 + 0.4, 0.0, 1.0);

  // Рассветный градиент: розово-оранжевый у горизонта, нежно-голубой вверху
  vec3 horizon = vec3(1.0, 0.55, 0.45);   // тёплый розово-оранжевый
  vec3 mid     = vec3(0.85, 0.45, 0.65);  // розово-сиреневый
  vec3 zenith  = vec3(0.45, 0.62, 0.95);  // нежно-голубой
  vec3 col = mix(horizon, mix(mid, zenith, t), t);

  // Солнце у горизонта — тёплое золотое
  vec3 sunDir = normalize(vec3(0.6, 0.08, -0.8));
  float sun = dot(dir, sunDir);
  float sunDisk = smoothstep(0.994, 1.0, sun);
  float sunGlow = smoothstep(0.6, 0.994, sun);
  col += sunGlow * vec3(1.0, 0.7, 0.3) * 0.5;
  col += sunDisk * vec3(1.0, 0.95, 0.7) * 2.0;

  // Облака — лёгкие розовые
  float yy = max(abs(dir.y), 0.05);
  vec2 uv = dir.xz / yy;
  float cloud = fbm(uv * 0.4 + vec2(uTime * 0.008, 0.0));
  float cloudMask = smoothstep(0.52, 0.72, cloud) * smoothstep(0.0, 0.25, dir.y);
  col = mix(col, vec3(1.0, 0.78, 0.72), cloudMask * 0.55);

  gl_FragColor = vec4(col, 1.0);
}
`

export function BedSky() {
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
