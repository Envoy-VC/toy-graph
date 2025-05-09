'use client';

import { Canvas as ThreeCanvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { Leva } from 'leva';
import dynamic from 'next/dynamic';
import { useActivityStore } from '~/stores';
import { Environment } from './environment';
import { Experience } from './experience';

const Joystick = dynamic(
  () => import('./experience/joystick').then((m) => m.Joystick),
  { ssr: false }
);

export const Canvas = () => {
  const { isPhysicsEnabled } = useActivityStore();
  return (
    <>
      <Joystick />
      <ThreeCanvas
        shadows={true}
        camera={{
          position: [-50, 20, 30],
          fov: 60,
        }}
        style={{ position: 'absolute', inset: '0', touchAction: 'none' }}
        gl={{ localClippingEnabled: true }}
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
