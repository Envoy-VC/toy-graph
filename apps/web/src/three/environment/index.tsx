import { Environment as ThreeEnvironment } from '@react-three/drei';
import { Controls } from './controls';
import { Ground } from './ground';
import { Lights } from './lights';

export const Environment = () => {
  return (
    <>
      <ThreeEnvironment
        preset='forest'
        background={false}
      />
      <Ground />
      <Lights />
      <Controls />
    </>
  );
};
