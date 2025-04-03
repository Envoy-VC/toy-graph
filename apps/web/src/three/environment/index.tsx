import { Environment as ThreeEnvironment } from '@react-three/drei';
import { Ground } from './ground';
import { Lights } from './lights';
import { Performance } from './performance';

export const Environment = () => {
  return (
    <>
      <ThreeEnvironment
        preset='forest'
        background={false}
      />
      <Ground />
      <Lights />
      <Performance />
    </>
  );
};
