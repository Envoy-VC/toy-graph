'use client';

import { CameraControls, Environment } from '@react-three/drei';
import { Canvas as ThreeCanvas } from '@react-three/fiber';
import { Perf } from 'r3f-perf';
import { DEG2RAD } from 'three/src/math/MathUtils.js';
import { ActivityGraphInstanced } from './activity-graph-instanced';
import { Ground } from './ground';
import { Lights } from './lights';
import { data } from './test';

export const Canvas = () => {
  return (
    <>
      <ThreeCanvas
        shadows={true}
        camera={{ position: [40, 20, -10], fov: 60 }}
        className='bg-[#303035]'
      >
        <Lights />

        <group position={[data.weeks.length / 2, 0, 0]}>
          <ActivityGraphInstanced data={data} />
          <Ground />
          <Environment
            preset='forest'
            background={false}
          />
        </group>
        <CameraControls
          makeDefault={true}
          maxPolarAngle={80 * DEG2RAD}
          minPolarAngle={0 * DEG2RAD}
          minAzimuthAngle={-Math.PI}
          maxAzimuthAngle={Math.PI}
          minDistance={10}
          maxDistance={50}
        />
        <Perf />
      </ThreeCanvas>
    </>
  );
};
