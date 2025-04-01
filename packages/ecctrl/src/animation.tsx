import { useAnimations, useGLTF } from '@react-three/drei';
import { Suspense, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useGame } from './stores';
import type { AnimationSet } from './types';

export type EcctrlAnimationProps = {
  characterURL: string;
  animationSet: AnimationSet;
  children: React.ReactNode;
};

export const EcctrlAnimation = (props: EcctrlAnimationProps) => {
  // biome-ignore lint/style/noNonNullAssertion: safe
  const group = useRef<THREE.Group>(null!);
  const { animations } = useGLTF(props.characterURL);
  const { actions } = useAnimations(animations, group);

  /**
   * Character animations setup
   */
  const curAnimation = useGame((state) => state.curAnimation);
  const resetAnimation = useGame((state) => state.reset);
  const initializeAnimationSet = useGame(
    (state) => state.initializeAnimationSet
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: only run once
  useEffect(() => {
    // Initialize animation set
    initializeAnimationSet(props.animationSet);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: only run once
  useEffect(() => {
    // Play animation
    const toPlay = curAnimation
      ? curAnimation
      : (props.animationSet.idle as string);
    const action = actions[toPlay];

    // For jump and jump land animation, only play once and clamp when finish
    if (
      curAnimation === props.animationSet.jump ||
      curAnimation === props.animationSet.jumpLand ||
      curAnimation === props.animationSet.action1 ||
      curAnimation === props.animationSet.action2 ||
      curAnimation === props.animationSet.action3 ||
      curAnimation === props.animationSet.action4
    ) {
      if (!action) return;
      action.reset().fadeIn(0.2).setLoop(THREE.LoopOnce, 0).play();
      action.clampWhenFinished = true;
    } else {
      if (!action) return;
      action.reset().fadeIn(0.2).play();
    }

    // When any action is clamp and finished reset animation
    const mixer: THREE.AnimationMixer = action.getMixer();
    mixer.addEventListener('finished', () => resetAnimation());

    return () => {
      action.fadeOut(0.2);

      // Clean up mixer listener
      mixer.removeEventListener('finished', () => resetAnimation());
      //   mixer._listeners = [];
    };
  }, [curAnimation]);

  return (
    <Suspense fallback={null}>
      <group
        ref={group}
        dispose={null}
        userData={{ camExcludeCollision: true }}
      >
        {/* Replace character model here */}
        {props.children}
      </group>
    </Suspense>
  );
};
