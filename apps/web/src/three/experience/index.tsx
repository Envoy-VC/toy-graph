import { Suspense } from 'react';
import { Stage } from '../models';
import { Character } from './character';
import { ActivityGraphText } from './text';
import { ActivityGraph } from './activity-graph';
import { useActivityStore } from '~/stores';

export const Experience = () => {
  const { data } = useActivityStore();
  return (
    <Suspense fallback={null}>
      <Character />
      <ActivityGraphText />
      <Stage
        castShadow={true}
        receiveShadow={true}
        bottomWidth={70}
        topWidth={66}
        height={1.5}
        bottomDepth={10}
        topDepth={8}
        position={[-1, 0.4, 0]}
      />
      <mesh
        position={[32, 1.9, 0]}
        castShadow={true}
        receiveShadow={true}
      >
        <ActivityGraph data={data} />
      </mesh>
    </Suspense>
  );
};
