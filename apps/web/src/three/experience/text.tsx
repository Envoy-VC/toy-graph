import { Svg, Text } from '@react-three/drei';

import { DEG2RAD } from 'three/src/math/MathUtils.js';
import { useActivityStore } from '~/stores';

export const ActivityGraphText = () => {
  const { data } = useActivityStore();
  return (
    <>
      <mesh position={[30, 0.8, 4.5]}>
        <Text
          rotation={[-32 * DEG2RAD, 0, 0]}
          fontWeight={600}
        >
          {data.year}
        </Text>
      </mesh>
      <mesh position={[-32, 0.8, 4.5]}>
        <Text
          rotation={[-32 * DEG2RAD, 0, 0]}
          fontWeight={600}
          anchorX='left'
        >
          {data.username}
        </Text>
      </mesh>
      <mesh position={[-33.5, 1.25, 4.25]}>
        <Svg
          rotation={[-32 * DEG2RAD, 0, 0]}
          scale={0.01}
          src='/github.svg'
        />
      </mesh>
    </>
  );
};
