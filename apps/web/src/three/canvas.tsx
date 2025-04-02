'use client';

import { Canvas as ThreeCanvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { Leva } from 'leva';
import { useActivityStore } from '~/stores';
import { Environment } from './environment';
import { Experience } from './experience';

export const Canvas = () => {
  const { isPhysicsEnabled } = useActivityStore();
  return (
    <>
      <ThreeCanvas
        shadows={true}
        camera={{
          position: [-50, 20, 30],
          fov: 60,
        }}
        className='bg-[#E9E3C7]'
        onPointerDown={(e) => {
          if (e.pointerType === 'mouse') {
            (e.target as HTMLCanvasElement).requestPointerLock();
          }
        }}
      >
        <Physics
          timeStep='vary'
          paused={!isPhysicsEnabled}
        >
          <Environment />
          <Experience />
        </Physics>
      </ThreeCanvas>
      <Leva hidden={process.env.NODE_ENV === 'production'} />
    </>
  );
};
