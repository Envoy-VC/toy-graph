// import { CameraControls } from '@react-three/drei';
import { Perf } from 'r3f-perf';
// import { DEG2RAD } from 'three/src/math/MathUtils.js';

export const Controls = () => {
  return (
    <>
      {/* <CameraControls
        makeDefault={true}
        maxPolarAngle={80 * DEG2RAD}
        minPolarAngle={0 * DEG2RAD}
        minAzimuthAngle={-Math.PI}
        maxAzimuthAngle={Math.PI}
        minDistance={10}
        maxDistance={50}
      /> */}
      <Perf
        position='top-left'
        className={process.env.NODE_ENV === 'development' ? 'block' : 'hidden'}
      />
    </>
  );
};
