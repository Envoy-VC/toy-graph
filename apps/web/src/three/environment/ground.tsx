import { Grid } from '@react-three/drei';

export const Ground = () => {
  return (
    <>
      <mesh
        receiveShadow={true}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.1, 0]}
      >
        <planeGeometry args={[100, 100]} />
        <shadowMaterial
          transparent={true}
          opacity={0.4}
        />
      </mesh>
      <Grid
        args={[30, 30]}
        position={[0, 0, 0]}
        infiniteGrid={true}
        sectionColor='#033316'
        cellColor='#4D9F37'
      />
    </>
  );
};
