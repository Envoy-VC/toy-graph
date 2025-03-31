import { Text } from '@react-three/drei';
import { DEG2RAD } from 'three/src/math/MathUtils.js';
import { Stage } from '../models';
import { ActivityGraph } from './activity-graph';

import data from 'public/data.json' assert { type: 'json' };

export const Experience = () => {
  return (
    <>
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
          <ActivityGraph data={data} />
        </mesh>
      </group>
    </>
  );
};
