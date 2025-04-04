import { useActivityStore } from '~/stores';
import { Stage } from '../models';
import { ActivityGraph } from './activity-graph';
import { Character } from './character';
import { ActivityGraphText } from './text';

export const Experience = () => {
  const { data } = useActivityStore();
  return (
    <>
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
    </>
  );
};
