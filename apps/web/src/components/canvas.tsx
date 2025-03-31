'use client';

import { CameraControls, Environment, Text } from '@react-three/drei';
import { Canvas as ThreeCanvas } from '@react-three/fiber';
import { Perf } from 'r3f-perf';
import { DEG2RAD } from 'three/src/math/MathUtils.js';
import { ActivityGraphInstanced } from './activity-graph-instanced';
import { Ground } from './ground';
import { Lights } from './lights';
import { Stage } from './stage';
import { data } from './test';

export const Canvas = () => {
  return (
    <>
      <ThreeCanvas
        shadows={true}
        camera={{ position: [10, 20, 0], fov: 60 }}
        className='bg-[#303035]'
      >
        <Lights />
        <group position={[32, 0, 0]}>
          <group position={[-0.5, 0, 0]}>
            <Stage
              bottomWidth={70}
              topWidth={66}
              height={1.5}
              bottomDepth={10}
              topDepth={8}
              position={[-(data.weeks.length + 12) / 2, 0, 0]}
            />
            <mesh position={[-63, 0.8, -4.5]}>
              <Text
                rotation={[32 * DEG2RAD, -Math.PI, 0]}
                fontWeight={600}
              >
                2024
              </Text>
            </mesh>
            <mesh position={[-4, 0.8, -4.5]}>
              <Text
                rotation={[32 * DEG2RAD, -Math.PI, 0]}
                fontWeight={600}
                textAlign='right'
              >
                Envoy-VC
              </Text>
            </mesh>
          </group>
          <mesh position={[0, 1.5, -4]}>
            <ActivityGraphInstanced data={data} />
          </mesh>
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
