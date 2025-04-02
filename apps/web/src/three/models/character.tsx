import {
  SpriteAnimator,
  Trail,
  useAnimations,
  useGLTF,
  useTexture,
} from '@react-three/drei';
import { type ThreeElements, useFrame } from '@react-three/fiber';
import { BallCollider, type RapierCollider, vec3 } from '@react-three/rapier';
import { useGame } from '@repo/ecctrl';
import { useControls } from 'leva';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import type { GLTF } from 'three-stdlib';

export const CharacterModel = (props: ThreeElements['group']) => {
  // Change the character src to yours
  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  const group = useRef<THREE.Group>(null!);
  const { nodes, animations } = useGLTF('/floating-character.glb') as GLTF & {
    // biome-ignore lint/suspicious/noExplicitAny: safe
    nodes: any;
  };
  const { actions } = useAnimations(animations, group);
  // gradientMapTexture for MeshToonMaterial
  const gradientMapTexture = useTexture('./textures/3.jpg');
  gradientMapTexture.minFilter = THREE.NearestFilter;
  gradientMapTexture.magFilter = THREE.NearestFilter;
  gradientMapTexture.generateMipmaps = false;

  /**
   * Prepare hands ref for attack action
   */
  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  const rightHandRef = useRef<THREE.Group>(null!);
  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  const rightHandColliderRef = useRef<RapierCollider>(null!);
  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  const leftHandRef = useRef<THREE.Group>(null!);
  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  const leftHandColliderRef = useRef<RapierCollider>(null!);
  const rightHandPos = useMemo(() => new THREE.Vector3(), []);
  const leftHandPos = useMemo(() => new THREE.Vector3(), []);
  const bodyPos = useMemo(() => new THREE.Vector3(), []);
  const bodyRot = useMemo(() => new THREE.Quaternion(), []);

  let rightHand: THREE.Object3D | null = null;
  let leftHand: THREE.Object3D | null = null;
  let mugModel: THREE.Object3D | null = null;

  /**
   * Prepare punch effect sprite
   */
  const [punchEffectProps, setPunchEffectProp] = useState({
    visible: false,
    scale: [1, 1, 1],
    play: false,
    position: [-0.2, -0.2, 0.5],
    startFrame: 0,
  });

  /**
   * Debug settings
   */
  const { mainColor, outlineColor, trailColor } = useControls(
    'Character Model',
    {
      mainColor: 'mediumslateblue',
      outlineColor: 'black',
      trailColor: 'violet',
    }
  );

  /**
   * Prepare replacing materials
   */
  const outlineMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: outlineColor,
        transparent: true,
      }),
    [outlineColor]
  );
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const meshToonMaterial = useMemo(
    () =>
      new THREE.MeshToonMaterial({
        color: mainColor,
        gradientMap: gradientMapTexture,
        transparent: true,
      }),
    [mainColor]
  );

  /**
   * Character animations setup
   */
  const curAnimation = useGame((state) => state.curAnimation);
  const resetAnimation = useGame((state) => state.reset);
  const initializeAnimationSet = useGame(
    (state) => state.initializeAnimationSet
  );

  // Rename your character animations here
  const animationSet = {
    idle: 'Idle',
    walk: 'Walk',
    run: 'Run',
    jump: 'Jump_Start',
    jumpIdle: 'Jump_Idle',
    jumpLand: 'Jump_Land',
    fall: 'Climbing', // This is for falling from high sky
    action1: 'Wave',
    action2: 'Dance',
    action3: 'Cheer',
    action4: 'Attack(1h)',
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    // Initialize animation set
    initializeAnimationSet(animationSet);
  }, []);

  useEffect(() => {
    group.current.traverse((obj) => {
      // Prepare both hands bone object
      if (obj instanceof THREE.Bone) {
        if (obj.name === 'handSlotRight') rightHand = obj;
        if (obj.name === 'handSlotLeft') leftHand = obj;
      }
      // Prepare mug model for cheer action
      if (obj.name === 'mug') {
        mugModel = obj;
        mugModel.visible = false;
      }
    });
  });

  useFrame(() => {
    if (curAnimation === animationSet.action4) {
      if (rightHand) {
        rightHand.getWorldPosition(rightHandPos);
        group.current.getWorldPosition(bodyPos);
        group.current.getWorldQuaternion(bodyRot);
      }

      // Apply hands position to hand colliders
      if (rightHandColliderRef.current) {
        // check if parent group autobalance is on or off
        if (
          group.current.parent?.quaternion.y === 0 &&
          group.current.parent?.quaternion.w === 1
        ) {
          rightHandRef.current.position
            .copy(rightHandPos)
            .sub(bodyPos)
            .applyQuaternion(bodyRot.conjugate());
        } else {
          rightHandRef.current.position.copy(rightHandPos).sub(bodyPos);
        }
        rightHandColliderRef.current.setTranslationWrtParent(
          rightHandRef.current.position
        );
      }
    }
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
  useEffect(() => {
    // Play animation
    const action = actions[curAnimation ? curAnimation : animationSet.jumpIdle];

    // For jump and jump land animation, only play once and clamp when finish
    if (
      curAnimation === animationSet.jump ||
      curAnimation === animationSet.jumpLand ||
      curAnimation === animationSet.action1 ||
      curAnimation === animationSet.action2 ||
      curAnimation === animationSet.action3 ||
      curAnimation === animationSet.action4
    ) {
      if (!action) return;
      action.reset().fadeIn(0.2).setLoop(THREE.LoopOnce, 0).play();
      action.clampWhenFinished = true;
      // Only show mug during cheer action
      if (curAnimation === animationSet.action3) {
        if (!mugModel) return;
        mugModel.visible = true;
      } else {
        if (!mugModel) return;
        mugModel.visible = false;
      }
    } else {
      action?.reset().fadeIn(0.2).play();
      if (!mugModel) return;
      mugModel.visible = false;
    }

    // When any action is clamp and finished reset animation
    const mixer = action?.getMixer();
    mixer?.addEventListener('finished', () => resetAnimation());

    return () => {
      // Fade out previous action
      action?.fadeOut(0.2);

      // Clean up mixer listener, and empty the _listeners array
      mixer?.removeEventListener('finished', () => resetAnimation());

      // Move hand collider back to initial position after action
      if (
        curAnimation === animationSet.action4 &&
        rightHandColliderRef.current
      ) {
        rightHandColliderRef.current.setTranslationWrtParent(
          vec3({ x: 0, y: 0, z: 0 })
        );
      }
    };
  }, [curAnimation]);

  return (
    <Suspense fallback={<capsuleGeometry args={[0.3, 0.7]} />}>
      <BallCollider
        args={[0.5]}
        position={[0, 0.45, 0]}
      />
      {/* Right hand collider */}
      <group ref={rightHandRef} />
      <BallCollider
        args={[0.1]}
        ref={rightHandColliderRef}
        onCollisionEnter={(e) => {
          if (curAnimation === animationSet.action4) {
            // Play punch effect
            setPunchEffectProp((prev) => ({
              ...prev,
              visible: true,
              play: true,
            }));
          }
        }}
      />

      {/* Left hand collider */}
      <group ref={leftHandRef} />
      <BallCollider
        args={[0.1]}
        ref={leftHandColliderRef}
      />
      {/* Character model */}
      <group
        ref={group}
        {...props}
        dispose={null}
      >
        <group
          name='Scene'
          scale={0.8}
          position={[0, -0.6, 0]}
        >
          <group name='KayKit_Animated_Character'>
            <skinnedMesh
              name='outline'
              geometry={nodes.outline.geometry}
              material={outlineMaterial}
              skeleton={nodes.outline.skeleton}
            />
            <skinnedMesh
              name='PrototypePete'
              geometry={nodes.PrototypePete.geometry}
              material={meshToonMaterial}
              skeleton={nodes.PrototypePete.skeleton}
              receiveShadow={true}
              castShadow={true}
            />
            <Trail
              width={1.5}
              color={trailColor}
              length={1.5}
              attenuation={(width) => width}
            >
              <primitive object={nodes.Body} />
            </Trail>
          </group>
        </group>
        <SpriteAnimator
          visible={punchEffectProps.visible}
          scale={punchEffectProps.scale as [number, number, number]}
          position={punchEffectProps.position as [number, number, number]}
          startFrame={punchEffectProps.startFrame}
          loop={true}
          onLoopEnd={() => {
            setPunchEffectProp((prev) => ({
              ...prev,
              visible: false,
              play: false,
            }));
          }}
          play={punchEffectProps.play}
          numberOfFrames={7}
          alphaTest={0.01}
          textureImageURL='/punchEffect.png'
        />
      </group>
    </Suspense>
  );
};

// Change the character src to yours
useGLTF.preload('/floating-character.glb');
