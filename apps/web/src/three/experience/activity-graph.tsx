import { Instance, Instances } from '@react-three/drei';
import {
  InstancedRigidBodies,
  type InstancedRigidBodyProps,
  type RapierRigidBody,
} from '@react-three/rapier';
import { useMemo, useRef } from 'react';
import { MeshPhysicalMaterial } from 'three';
import { getInstancesData, groupTrapProps } from '~/helpers';
import { useRoundedTrapeziumGeometry } from '~/hooks';
import type { ContributionData, GroupedTrapeziumInstanceProps } from '~/types';

export const ActivityGraph = ({ data }: { data: ContributionData }) => {
  const groups = groupTrapProps(getInstancesData(data));

  return (
    <>
      {groups.map((group) => {
        return (
          <GroupInstance
            key={`${group.key}-${group.instances.length}`}
            group={group}
          />
        );
      })}
    </>
  );
};

interface GroupInstanceProps {
  group: GroupedTrapeziumInstanceProps;
}

export const GroupInstance = ({ group }: GroupInstanceProps) => {
  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  const rigidBodiesRef = useRef<RapierRigidBody[]>(null!);
  const { instances: groupTraps, key } = group;
  // biome-ignore lint/style/noNonNullAssertion: we know it's not null
  const { args, color } = groupTraps[0]!;

  const geometry = useRoundedTrapeziumGeometry(args[1], args[2]);

  const instances = useMemo(() => {
    const instances: InstancedRigidBodyProps[] = [];

    for (let i = 0; i < groupTraps.length; i++) {
      instances.push({
        key: `instance-${key}-${i.toString()}`,
        position: groupTraps[i]?.position,
        rotation: [0, Math.PI / 2, 0],
        type: 'fixed',
      });
    }

    return instances;
  }, [groupTraps, key]);

  return (
    <InstancedRigidBodies
      instances={instances}
      ref={rigidBodiesRef}
    >
      <Instances
        key={`${group.key}-${groupTraps.length}`}
        frustumCulled={false}
        castShadow={true}
        receiveShadow={true}
        geometry={geometry}
        limit={groupTraps.length}
        material={
          new MeshPhysicalMaterial({
            roughness: 0.2,
            metalness: 0.1,
            clearcoat: 1,
            clearcoatRoughness: 0.1,
            color: color,
          })
        }
      >
        {groupTraps.map((trap, i) => {
          return (
            <>
              <Instance
                castShadow={true}
                receiveShadow={true}
                key={`${key}-${i.toString()}`}
                position={trap.position}
                rotation={[0, Math.PI / 2, 0]}
              />
            </>
          );
        })}
      </Instances>
    </InstancedRigidBodies>
  );
};
