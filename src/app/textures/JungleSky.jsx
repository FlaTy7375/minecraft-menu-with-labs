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
  float t = clamp(dir.y * 2.0, 0.0, 1.0);

  // Вечернее пасмурное небо
  vec3 skyBottom = vec3(0.32, 0.32, 0.32);
  vec3 skyTop    = vec3(0.16, 0.16, 0.18);
  vec3 skyColor  = mix(skyBottom, skyTop, t);

  // Тяжёлые тёмные облака
  float yy = max(dir.y, 0.05);
  vec2 uv = (dir.xz / yy) * 0.35 + vec2(uTime * 0.005, 0.0);
  float cloud = fbm(uv);
  float cloudMask = smoothstep(0.35, 0.58, cloud) * smoothstep(0.0, 0.15, dir.y);
  vec3 cloudColor = vec3(0.38, 0.37, 0.36);
  skyColor = mix(skyColor, cloudColor, cloudMask * 0.95);

  gl_FragColor = vec4(skyColor, 1.0);
}
`

export function JungleSky() {
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
