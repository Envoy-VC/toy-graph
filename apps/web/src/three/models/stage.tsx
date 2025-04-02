import type { ThreeElements } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import type React from 'react';
import { useMemo } from 'react';
import { BufferAttribute, BufferGeometry, DoubleSide } from 'three';

export type TruncatedPyramidStageProps = ThreeElements['mesh'] & {
  bottomWidth: number; // width of the bottom face
  bottomDepth: number; // depth of the bottom face
  topWidth: number; // width of the top face
  topDepth: number; // depth of the top face
  height: number; // vertical height of the pyramid
};

export const Stage: React.FC<TruncatedPyramidStageProps> = ({
  bottomWidth,
  bottomDepth,
  topWidth,
  topDepth,
  height,
  ...props
}) => {
  // Build the geometry for a truncated pyramid (cut pyramid)
  const geometry = useMemo(() => {
    const geo = new BufferGeometry();

    // Half sizes for easier calculations.
    const halfBW = bottomWidth / 2;
    const halfBD = bottomDepth / 2;
    const halfTW = topWidth / 2;
    const halfTD = topDepth / 2;

    // Define eight vertices:
    // Bottom face (y = 0)
    const vertices = new Float32Array([
      -halfBW,
      0,
      -halfBD, // v0: bottom left-back
      halfBW,
      0,
      -halfBD, // v1: bottom right-back
      halfBW,
      0,
      halfBD, // v2: bottom right-front
      -halfBW,
      0,
      halfBD, // v3: bottom left-front

      // Top face (y = height)
      -halfTW,
      height,
      -halfTD, // v4: top left-back
      halfTW,
      height,
      -halfTD, // v5: top right-back
      halfTW,
      height,
      halfTD, // v6: top right-front
      -halfTW,
      height,
      halfTD, // v7: top left-front
    ]);

    // Define indices for two triangles per face.
    const indices = [
      // Bottom face
      0, 1, 2, 0, 2, 3,

      // Top face (ensure correct winding order)
      4, 6, 5, 4, 7, 6,

      // Side face 1 (back)
      0, 1, 5, 0, 5, 4,

      // Side face 2 (right)
      1, 2, 6, 1, 6, 5,

      // Side face 3 (front)
      2, 3, 7, 2, 7, 6,

      // Side face 4 (left)
      3, 0, 4, 3, 4, 7,
    ];

    geo.setIndex(indices);
    geo.setAttribute('position', new BufferAttribute(vertices, 3));
    geo.computeVertexNormals();

    return geo;
  }, [bottomWidth, bottomDepth, topWidth, topDepth, height]);

  return (
    <RigidBody
      type='fixed'
      colliders='trimesh'
    >
      <mesh
        geometry={geometry}
        {...props}
      >
        <meshPhysicalMaterial
          color='#000000'
          metalness={0.3}
          roughness={0.8}
          clearcoat={0.1}
          clearcoatRoughness={0.2}
          side={DoubleSide}
        />
      </mesh>
    </RigidBody>
  );
};
