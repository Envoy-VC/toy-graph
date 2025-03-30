import { useMemo } from 'react';
import { getInstancesData } from '~/helpers';
import type { ContributionData } from '~/types';
import { RoundedTrapezium } from './rounded-trapezium';

interface ActivityGraphProps {
  data: ContributionData;
}

export const ActivityGraph = ({ data }: ActivityGraphProps) => {
  const instancesData = useMemo(() => getInstancesData(data), [data]);
  return (
    <>
      {instancesData.map((props, index) => {
        const { args, position, color } = props;
        return (
          <RoundedTrapezium
            castShadow={true}
            key={`trap-${index.toString()}`}
            args={args}
            radius={0.1}
            position={position}
            rotation={[0, Math.PI / 2, 0]}
          >
            <meshPhysicalMaterial
              roughness={0.2}
              metalness={0.1}
              clearcoat={1}
              clearcoatRoughness={0.1}
              color={color}
            />
          </RoundedTrapezium>
        );
      })}
    </>
  );
};
