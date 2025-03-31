'use client';
import { Canvas as ThreeCanvas } from '@react-three/fiber';
import { Environment } from './environment';
import { Experience } from './experience';

export const Canvas = () => {
  return (
    <>
      <ThreeCanvas
        shadows={true}
        camera={{ position: [10, 20, 0], fov: 60 }}
        className='bg-[#303035]'
      >
        <Environment />
        <Experience />
      </ThreeCanvas>
    </>
  );
};
