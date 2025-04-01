import { useGLTF } from '@react-three/drei';
import type { ThreeElements } from '@react-three/fiber';
import type * as three from 'three';
import type { GLTF } from 'three-stdlib';

type GLTFResult = GLTF & {
  nodes: {
    Character_B_1_1: three.SkinnedMesh;
    Character_B_1_2: three.SkinnedMesh;
    Character_B_1_3: three.SkinnedMesh;
    Hips: three.Bone;
  };
  materials: {
    'City Atlas': three.MeshStandardMaterial;
    'City Metal': three.MeshStandardMaterial;
    Hair: three.MeshStandardMaterial;
  };
};

export const Character = (props: ThreeElements['group']) => {
  const { nodes, materials } = useGLTF(
    '/character.glb'
  ) as unknown as GLTFResult;
  return (
    <group
      {...props}
      dispose={null}
    >
      <skinnedMesh
        geometry={nodes.Character_B_1_1.geometry}
        material={materials['City Atlas']}
        skeleton={nodes.Character_B_1_1.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Character_B_1_2.geometry}
        material={materials['City Metal']}
        skeleton={nodes.Character_B_1_2.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Character_B_1_3.geometry}
        material={materials.Hair}
        skeleton={nodes.Character_B_1_3.skeleton}
      />
      <primitive object={nodes.Hips} />
    </group>
  );
};

useGLTF.preload('/character.glb');
