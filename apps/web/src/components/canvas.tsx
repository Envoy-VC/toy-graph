import { CameraControls } from '@react-three/drei';
import { Canvas as ThreeCanvas } from '@react-three/fiber';
import { RoundedTrapezium } from './rounded-trapezium';

const activityMatrix = {
  rows: 7,
  columns: 7,
  data: [
    [0, 1, 1, 2, 2, 3, 0],
    [1, 2, 2, 3, 3, 3, 1],
    [1, 2, 4, 4, 4, 3, 1],
    [0, 1, 3, 5, 3, 2, 0],
    [0, 1, 2, 4, 4, 2, 0],
    [1, 2, 3, 3, 3, 2, 1],
    [0, 1, 2, 2, 1, 1, 0],
  ],
};

export const Canvas = () => {
  return (
    <ThreeCanvas
      camera={{ position: [1.5, 1.5, 1.5], near: 1, far: 1000 }}
      style={{ backgroundColor: '#D0D1B9' }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[30, 30, 30]}
        intensity={0.8}
      />
      <RoundedTrapezium
        args={[1, 1, 1.5, 1]}
        position={[0, 0, 0]}
        radius={0.1}
      >
        <meshPhongMaterial
          color='#f3f3f3'
          wireframe={true}
        />
      </RoundedTrapezium>
      <CameraControls />
    </ThreeCanvas>
  );
};
