import React, { useRef, useMemo, useLayoutEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, TorusKnot, Sphere, Environment } from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField, SSAO, Noise, ChromaticAberration } from '@react-three/postprocessing';
import * as THREE from 'three';
import { BlendFunction } from 'postprocessing';

interface BenchmarkSceneProps {
  objectCount: number;
  enablePostProcessing: boolean;
  enableShadows: boolean;
  rotationSpeed: number;
  complexity: number; // 0-1
}

const HeavyInstances = ({ count, speed, complexity }: { count: number; speed: number; complexity: number }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Generate random data once
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      const speedOffset = 0.01 + Math.random() * 0.05;
      const xFactor = -50 + Math.random() * 100;
      const yFactor = -50 + Math.random() * 100;
      const zFactor = -50 + Math.random() * 100;
      temp.push({ t, factor, speedOffset, xFactor, yFactor, zFactor });
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();
    const s = speed * 0.5;

    particles.forEach((particle, i) => {
      let { t, factor, speedOffset, xFactor, yFactor, zFactor } = particle;
      
      // Complex movement calculation to burn CPU/GPU bus
      // Higher complexity = more chaotic movement calculations
      const tMod = (time * speedOffset * s) + t;
      
      dummy.position.set(
        (Math.sin(tMod) * factor) + (Math.cos(time * 0.1) * xFactor * complexity),
        (Math.cos(tMod) * factor) + (Math.sin(time * 0.1) * yFactor * complexity),
        (Math.sin(tMod + Math.PI) * factor) + (Math.cos(time * 0.2) * zFactor)
      );

      dummy.rotation.set(
        Math.sin(tMod) * 2,
        Math.cos(tMod) * 2,
        Math.sin(tMod) * 2
      );

      const scale = 1 + Math.sin(tMod * 5) * 0.5;
      dummy.scale.set(scale, scale, scale);

      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow receiveShadow>
      {/* High poly geometry for stress */}
      <octahedronGeometry args={[1, 1]} /> 
      <meshStandardMaterial 
        color="#222" 
        roughness={0.2} 
        metalness={0.9} 
        emissive="#ff003c"
        emissiveIntensity={0.2}
      />
    </instancedMesh>
  );
};

const CentralObject = ({ complexity }: { complexity: number }) => {
    const mesh = useRef<THREE.Mesh>(null);
    
    useFrame((state) => {
        if(mesh.current) {
            mesh.current.rotation.x = state.clock.elapsedTime * 0.2;
            mesh.current.rotation.y = state.clock.elapsedTime * 0.5;
        }
    });

    return (
        <TorusKnot ref={mesh} args={[10, 3, 200, 32]} position={[0,0,0]}>
            <meshPhysicalMaterial 
                color="#00f3ff" 
                roughness={0.1} 
                metalness={0.9}
                clearcoat={1}
                clearcoatRoughness={0.1}
                wireframe={complexity > 0.8}
            />
        </TorusKnot>
    )
}

const SceneContent: React.FC<BenchmarkSceneProps> = ({ objectCount, enablePostProcessing, enableShadows, rotationSpeed, complexity }) => {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 80]} fov={50} />
      <OrbitControls enableDamping autoRotate autoRotateSpeed={rotationSpeed} />
      
      <ambientLight intensity={0.5} />
      <pointLight 
        position={[50, 50, 50]} 
        intensity={2000} 
        color="#00f3ff" 
        castShadow={enableShadows} 
        shadow-mapSize-width={2048} 
        shadow-mapSize-height={2048}
      />
      <pointLight 
        position={[-50, -50, 50]} 
        intensity={2000} 
        color="#ff003c" 
        castShadow={enableShadows} 
      />

      <HeavyInstances count={objectCount} speed={rotationSpeed} complexity={complexity} />
      <CentralObject complexity={complexity} />

      {enablePostProcessing && (
        <EffectComposer multisampling={0} disableNormalPass={false}>
          {/* Expensive SSAO */}
          <SSAO 
            samples={31} 
            radius={20} 
            intensity={20} 
            luminanceInfluence={0.6} 
            color={undefined} 
            worldDistanceThreshold={Infinity}
            worldDistanceFalloff={undefined} 
            worldProximityThreshold={undefined} 
            worldProximityFalloff={undefined}
          />
          <Bloom 
            intensity={1.5} 
            luminanceThreshold={0.2} 
            luminanceSmoothing={0.9} 
            mipmapBlur 
          />
          {complexity > 0.5 && (
             <DepthOfField focusDistance={0} focalLength={0.02} bokehScale={2} height={480} />
          )}
          <ChromaticAberration 
            offset={new THREE.Vector2(0.002 * complexity, 0.002 * complexity)} 
            radialModulation={false} 
            modulationOffset={0} 
          />
          <Noise opacity={0.1} blendFunction={BlendFunction.OVERLAY} />
        </EffectComposer>
      )}
      <Environment preset="city" />
    </>
  );
};

export const BenchmarkScene: React.FC<BenchmarkSceneProps> = (props) => {
  return (
    <div className="w-full h-full bg-cyber-black absolute top-0 left-0 -z-10">
      <Canvas 
        shadows={props.enableShadows}
        gl={{ 
          powerPreference: "high-performance", 
          antialias: false, 
          stencil: false, 
          depth: true 
        }}
        dpr={[1, 2]} // Force higher resolution for stress
      >
        <SceneContent {...props} />
      </Canvas>
    </div>
  );
};
