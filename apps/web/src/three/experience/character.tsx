import { KeyboardControls } from '@react-three/drei';
import { Ecctrl, type EcctrlRigidBodyRef } from '@repo/ecctrl';
import { useEffect, useRef } from 'react';
import { degToRad } from 'three/src/math/MathUtils.js';
import { useActivityStore } from '~/stores';
import { CharacterModel } from '../models';

const keyboardMap = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'leftward', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'rightward', keys: ['ArrowRight', 'KeyD'] },
  { name: 'jump', keys: ['Space'] },
  { name: 'run', keys: ['Shift'] },
  { name: 'action1', keys: ['1'] },
  { name: 'action2', keys: ['2'] },
  { name: 'action3', keys: ['3'] },
  { name: 'action4', keys: ['KeyF'] },
];

export const Character = () => {
  // biome-ignore lint/style/noNonNullAssertion: safe
  const characterRef = useRef<EcctrlRigidBodyRef>(null!);
  const { setCharacterRef, characterColliderRef } = useActivityStore();

  useEffect(() => {
    if (characterRef.current) {
      setCharacterRef(characterRef);
    }
  }, [setCharacterRef]);

  return (
    <KeyboardControls map={keyboardMap}>
      <Ecctrl
        ref={characterRef}
        position={[-40, 10, 20]}
        debug={true}
        colliders={false}
        animated={true}
        followLight={true}
        springK={2}
        dampingC={0.2}
        autoBalanceSpringK={1.2}
        autoBalanceDampingC={0.04}
        autoBalanceSpringOnY={0.7}
        autoBalanceDampingOnY={0.05}
        camInitDir={{ x: degToRad(10), y: degToRad(150) }}
        characterInitDir={degToRad(120)}
      >
        <CharacterModel />
      </Ecctrl>
    </KeyboardControls>
  );
};
