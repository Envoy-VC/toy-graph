import type { NamedArrayTuple } from '@react-three/drei/helpers/ts-utils';
import type { ThreeElements } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import type { ExtrudeGeometry } from 'three';
import { toCreasedNormals } from 'three-stdlib';
import { createTrapeziumShape, eps } from '~/helpers/three';

export type RoundedTrapeziumProps = {
  args?: NamedArrayTuple<
    (width?: number, side1?: number, side2?: number, depth?: number) => void
  >;
  radius?: number;
  smoothness?: number;
  bevelSegments?: number;
  steps?: number;
  creaseAngle?: number;
} & Omit<ThreeElements['mesh'], 'ref' | 'args'>;

export const RoundedTrapezium = ({
  args: [width = 1, side1 = 2, side2 = 2.5, depth = 1] = [],
  radius = 0.05,
  steps = 1,
  smoothness = 4,
  bevelSegments = 4,
  creaseAngle = 0.4,
  children,
  ...rest
}: RoundedTrapeziumProps) => {
  const shape = useMemo(
    () => createTrapeziumShape(width, side1, side2, radius),
    [radius, width, side1, side2]
  );

  const params = useMemo(
    () => ({
      depth: depth - radius * 2,
      bevelEnabled: true,
      bevelSegments: bevelSegments * 2,
      steps,
      bevelSize: radius - eps,
      bevelThickness: radius,
      curveSegments: smoothness,
    }),
    [depth, radius, smoothness, bevelSegments, steps]
  );

  // biome-ignore lint/style/noNonNullAssertion: safe
  const geomRef = useRef<ExtrudeGeometry>(null!);

  // biome-ignore lint/correctness/useExhaustiveDependencies: safe
  useLayoutEffect(() => {
    if (geomRef.current) {
      geomRef.current.center();
      toCreasedNormals(geomRef.current, creaseAngle);
    }
  }, [shape, params]);

  return (
    <mesh
      {...rest}
      castShadow={true}
      receiveShadow={true}
    >
      <extrudeGeometry
        ref={geomRef}
        args={[shape, params]}
      />
      {children}
    </mesh>
  );
};
