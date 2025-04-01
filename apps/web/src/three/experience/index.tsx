import { Stage } from '../models';

import { useActivityStore } from '~/stores';
import { ActivityGraph } from './activity-graph';
import { ActivityGraphText } from './text';

export const Experience = () => {
  const { data } = useActivityStore();
  return (
    <>
      <ActivityGraphText />

      <Stage
        castShadow={true}
        receiveShadow={true}
        bottomWidth={70}
        topWidth={66}
        height={1.5}
        bottomDepth={10}
        topDepth={8}
        position={[-1, 0, 0]}
      />
      <mesh
        position={[32, 1.52, 0]}
        castShadow={true}
        receiveShadow={true}
      >
        <ActivityGraph data={data} />
      </mesh>
    </>
  );
};
