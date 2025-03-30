import { useMemo } from 'react';
import { ExtrudeGeometry } from 'three';
import { toCreasedNormals } from 'three-stdlib';
import { createTrapeziumShape, eps } from '~/helpers/three';

export function useRoundedTrapeziumGeometry(
  side1: number,
  side2: number
): ExtrudeGeometry {
  const shape = useMemo(
    () => createTrapeziumShape(1, side1, side2, 0.1),
    [side1, side2]
  );

  const geometry = useMemo(() => {
    const params = {
      depth: 0.8,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.1 - eps,
      bevelThickness: 0.1,
      curveSegments: 4,
    };
    const geo = new ExtrudeGeometry(shape, params);
    geo.center();
    toCreasedNormals(geo, 0.4);
    return geo;
  }, [shape]);

  return geometry;
}
