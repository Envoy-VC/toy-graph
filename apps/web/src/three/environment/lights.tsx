export const Lights = () => {
  const directionalLightPosition = [-30, 20, -20] as const;

  return (
    <>
      <group>
        <ambientLight intensity={0.5} />
        <directionalLight
          castShadow={true}
          shadow-normalBias={0.06}
          position={[20, 30, 10]}
          intensity={5}
          shadow-mapSize={[1024, 1024]}
          shadow-camera-near={1}
          shadow-camera-far={50}
          shadow-camera-top={50}
          shadow-camera-right={50}
          shadow-camera-bottom={-50}
          shadow-camera-left={-50}
          name='followLight'
        />
        <ambientLight intensity={2} />
        <pointLight
          castShadow={true}
          position={directionalLightPosition}
          intensity={1}
          color='#9ECE5F'
        />
      </group>
    </>
  );
};
