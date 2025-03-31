export const Lights = () => {
  const directionalLightPosition = [-30, 20, -20] as const;

  return (
    <>
      <group>
        <ambientLight intensity={0.5} />
        <pointLight
          castShadow={true}
          position={directionalLightPosition}
          intensity={1}
          color='#9ECE5F'
        />
        <mesh position={directionalLightPosition}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshBasicMaterial
            color='white'
            wireframe={true}
          />
        </mesh>
      </group>
    </>
  );
};
