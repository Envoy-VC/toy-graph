import { useAnimations, useGLTF } from '@react-three/drei';
import type { ThreeElements } from '@react-three/fiber';
import { BallCollider } from '@react-three/rapier';
import { useGame } from '@repo/ecctrl';
import { Suspense, useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { GLTF } from 'three-stdlib';
import { animationSet } from '~/types';

type CharacterType = GLTF & {
  nodes: {
    Character_B_1006: THREE.SkinnedMesh;
    Character_B_1006_1: THREE.SkinnedMesh;
    Character_B_1006_2: THREE.SkinnedMesh;
    Hips: THREE.Bone;
    Hips_1: THREE.Bone;
  };
  materials: {
    'City Atlas.006': THREE.MeshStandardMaterial;
    'City Metal.006': THREE.MeshStandardMaterial;
    'Hair.006': THREE.MeshStandardMaterial;
  };
};

export const CharacterModel = (props: ThreeElements['group']) => {
  // biome-ignore lint/style/noNonNullAssertion: safe
  const group = useRef<THREE.Group>(null!);
  const { nodes, materials, animations } = useGLTF(
    'https://p8rfhqflvw.ufs.sh/f/KffpOtf8keDXeclERVI8Ry9mrTalXLBeIZ6C1stAhHfVuJz3?builder.glb'
  ) as unknown as CharacterType;
  const { actions } = useAnimations(animations, group);

  const {
    reset,
    initializeAnimationSet,
    curAnimation: currentAnimation,
  } = useGame();

  useEffect(() => {
    initializeAnimationSet(animationSet);
  }, [initializeAnimationSet]);

  useEffect(() => {
    // Play animation
    // biome-ignore lint/style/noNonNullAssertion: idle animation is always available
    const toPlay = currentAnimation ? currentAnimation : animationSet.idle!;
    const action = actions[toPlay];

    if (
      currentAnimation === animationSet.jump ||
      currentAnimation === animationSet.jumpLand ||
      currentAnimation === animationSet.action1 ||
      currentAnimation === animationSet.action2 ||
      currentAnimation === animationSet.action3 ||
      currentAnimation === animationSet.action4
    ) {
      if (!action) return;
      action.reset().fadeIn(0.2).setLoop(THREE.LoopOnce, 0).play();
      action.clampWhenFinished = true;
    } else {
      action?.reset().fadeIn(0.2).play();
    }

    // When any action is clamp and finished reset animation
    const mixer = action?.getMixer();
    mixer?.addEventListener('finished', () => reset());

    return () => {
      action?.fadeOut(0.2);
      mixer?.removeEventListener('finished', () => reset());
    };
  }, [currentAnimation, reset, actions]);

  return (
    <Suspense fallback={<capsuleGeometry args={[0.3, 0.7]} />}>
      <BallCollider
        args={[0.4]}
        position={[0, 0.75, 0]}
      />
      <group
        ref={group}
        {...props}
        rotation={[0, Math.PI / 2, 0]}
        position={[0, -0.85, 0]}
        dispose={null}
      >
        <group name='Scene'>
          <group name='Character'>
            <primitive object={nodes.Hips} />
          </group>
          <group name='CharacterArmature1'>
            <group name='Character_B_1'>
              <skinnedMesh
                name='Character_B_1006'
                geometry={nodes.Character_B_1006.geometry}
                material={materials['City Atlas.006']}
                skeleton={nodes.Character_B_1006.skeleton}
              />
              <skinnedMesh
                name='Character_B_1006_1'
                geometry={nodes.Character_B_1006_1.geometry}
                material={materials['City Metal.006']}
                skeleton={nodes.Character_B_1006_1.skeleton}
              />
              <skinnedMesh
                name='Character_B_1006_2'
                geometry={nodes.Character_B_1006_2.geometry}
                material={materials['Hair.006']}
                skeleton={nodes.Character_B_1006_2.skeleton}
              />
            </group>
            <primitive object={nodes.Hips_1} />
          </group>
        </group>
      </group>
    </Suspense>
  );
};

useGLTF.preload(
  'https://p8rfhqflvw.ufs.sh/f/KffpOtf8keDXeclERVI8Ry9mrTalXLBeIZ6C1stAhHfVuJz3?builder.glb'
);
