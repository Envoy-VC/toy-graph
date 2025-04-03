import { Grid } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';

export const Ground = () => {
  const groundSize = 100;
  const wallThickness = 1;
  const wallHeight = 10;
  const halfGround = groundSize / 2;
  const halfWall = wallThickness / 2;

  return (
    <>
      {/* Ground */}
      <RigidBody
        type='fixed'
        colliders='cuboid'
      >
        <mesh
          receiveShadow={true}
          position={[0, -0.1, 0]}
          renderOrder={1}
        >
          <boxGeometry args={[groundSize, 1, groundSize]} />
          <shadowMaterial
            transparent={true}
            opacity={0.4}
          />
        </mesh>
      </RigidBody>

      {/* Walls */}
      {/* Positive X Wall */}
      <RigidBody
        type='fixed'
        colliders='cuboid'
      >
        <mesh position={[halfGround + halfWall, wallHeight / 2, 0]}>
          <boxGeometry args={[wallThickness, wallHeight, groundSize]} />
          <meshStandardMaterial
            transparent={true}
            opacity={0}
            depthWrite={false}
          />
        </mesh>
      </RigidBody>

      {/* Negative X Wall */}
      <RigidBody
        type='fixed'
        colliders='cuboid'
      >
        <mesh position={[-(halfGround + halfWall), wallHeight / 2, 0]}>
          <boxGeometry args={[wallThickness, wallHeight, groundSize]} />
          <meshStandardMaterial
            transparent={true}
            opacity={0}
            depthWrite={false}
          />
        </mesh>
      </RigidBody>

      {/* Positive Z Wall */}
      <RigidBody
        type='fixed'
        colliders='cuboid'
      >
        <mesh position={[0, wallHeight / 2, halfGround + halfWall]}>
          <boxGeometry args={[groundSize, wallHeight, wallThickness]} />
          <meshStandardMaterial
            transparent={true}
            opacity={0}
            depthWrite={false}
          />
        </mesh>
      </RigidBody>

      {/* Negative Z Wall */}
      <RigidBody
        type='fixed'
        colliders='cuboid'
      >
        <mesh position={[0, wallHeight / 2, -(halfGround + halfWall)]}>
          <boxGeometry args={[groundSize, wallHeight, wallThickness]} />
          <meshStandardMaterial
            transparent={true}
            opacity={0}
            depthWrite={false}
          />
        </mesh>
      </RigidBody>

      <Grid
        args={[30, 30]}
        position={[0, 0.5, 0]}
        infiniteGrid={true}
        sectionColor='#033316'
        cellColor='#4D9F37'
        userData={{ camExcludeCollision: true }}
        renderOrder={1}
      />
    </>
  );
};
