'use client';
import { Canvas as ThreeCanvas } from '@react-three/fiber';
import { Environment } from './environment';
import { Experience } from './experience';

export const Canvas = () => {
  return (
    <>
      <ThreeCanvas
        shadows={true}
        camera={{ position: [-50, 20, 30], fov: 60 }}
        className='bg-[#E9E3C7]'
      >
        <Environment />
        <Experience />
      </ThreeCanvas>
    </>
  );
};
