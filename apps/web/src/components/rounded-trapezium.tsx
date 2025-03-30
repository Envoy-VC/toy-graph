import type { NamedArrayTuple } from '@react-three/drei/helpers/ts-utils';
import type { ThreeElements } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import { type ExtrudeGeometry, Shape } from 'three';
import { toCreasedNormals } from 'three-stdlib';

const eps = 0.00001;

function createTrapeziumShape(
  width: number,
  side1: number,
  side2: number,
  radius0: number
) {
  const shape = new Shape();
  const radius = radius0 - eps;

  const slope = (side2 - side1) / width;
  const angle = Math.PI / 2 + Math.atan(slope);

  shape.absarc(eps, eps, eps, -Math.PI / 2, -Math.PI, true);
  shape.absarc(eps, side1 - radius * 2, eps, Math.PI, angle, true);
  shape.absarc(
    width - radius * 2,
    side2 - radius * 2,
    eps,
    (7 * Math.PI) / 10,
    0,
    true
  );
  shape.absarc(width - radius * 2, eps, eps, 0, -Math.PI / 2, true);
  return shape;
}

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
      geomRef.current.translate(0, Math.abs(side1 - side2) / 2, 0);
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
