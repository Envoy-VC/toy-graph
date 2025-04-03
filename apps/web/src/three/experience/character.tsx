import { KeyboardControls } from '@react-three/drei';
import { CharacterModel } from '../models';

import { Ecctrl } from '@repo/ecctrl';
import { DEG2RAD } from 'three/src/math/MathUtils.js';

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
  return (
    <KeyboardControls map={keyboardMap}>
      <Ecctrl
        position={[-40, 10, 15]}
        rotation={[Math.PI / 2, 0, Math.PI / 2]}
        debug={true}
        animated={true}
        followLight={true}
        springK={2}
        dampingC={0.2}
        autoBalanceSpringK={1.2}
        autoBalanceDampingC={0.04}
        autoBalanceSpringOnY={0.7}
        autoBalanceDampingOnY={0.05}
        camInitDir={{ x: 10 * DEG2RAD, y: 150 * DEG2RAD }}
        characterInitDir={120 * DEG2RAD}
      >
        <CharacterModel />
      </Ecctrl>
    </KeyboardControls>
  );
};
