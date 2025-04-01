import type { RapierRigidBody, RigidBodyProps } from '@react-three/rapier';
import type { ReactNode } from 'react';

export type CameraListenerTargetType = 'document' | 'domElement';

export type UseFollowCameraProps = {
  disableFollowCam?: boolean;
  disableFollowCamPos?: { x: number; y: number; z: number };
  disableFollowCamTarget?: { x: number; y: number; z: number };
  camInitDis?: number;
  camMaxDis?: number;
  camMinDis?: number;
  camUpLimit?: number;
  camLowLimit?: number;
  camInitDir?: { x: number; y: number };
  camMoveSpeed?: number;
  camZoomSpeed?: number;
  camCollisionOffset?: number;
  camCollisionSpeedMult?: number;
  camListenerTarget?: CameraListenerTargetType;
};

export type AnimationSet = {
  idle?: string;
  walk?: string;
  run?: string;
  jump?: string;
  jumpIdle?: string;
  jumpLand?: string;
  fall?: string;
  // Currently support four additional animations
  action1?: string;
  action2?: string;
  action3?: string;
  action4?: string;
};

export interface EcctrlRigidBodyRef extends RapierRigidBody {
  rotateCamera?: (x: number, y: number) => void;
  rotateCharacterOnY?: (rad: number) => void;
}

export interface EcctrlProps extends RigidBodyProps {
  children?: ReactNode;
  debug?: boolean;
  capsuleHalfHeight?: number;
  capsuleRadius?: number;
  floatHeight?: number;
  characterInitDir?: number;
  followLight?: boolean;
  disableControl?: boolean;
  disableFollowCam?: boolean;
  disableFollowCamPos?: { x: number; y: number; z: number } | null;
  disableFollowCamTarget?: { x: number; y: number; z: number } | null;
  // Follow camera setups
  camInitDis?: number;
  camMaxDis?: number;
  camMinDis?: number;
  camUpLimit?: number;
  camLowLimit?: number;
  camInitDir?: { x: number; y: number };
  camTargetPos?: { x: number; y: number; z: number };
  camMoveSpeed?: number;
  camZoomSpeed?: number;
  camCollision?: boolean;
  camCollisionOffset?: number;
  camCollisionSpeedMult?: number;
  fixedCamRotMult?: number;
  camListenerTarget?: CameraListenerTargetType;
  // Follow light setups
  followLightPos?: { x: number; y: number; z: number };
  // Base control setups
  maxVelLimit?: number;
  turnVelMultiplier?: number;
  turnSpeed?: number;
  sprintMult?: number;
  jumpVel?: number;
  jumpForceToGroundMult?: number;
  slopJumpMult?: number;
  sprintJumpMult?: number;
  airDragMultiplier?: number;
  dragDampingC?: number;
  accDeltaTime?: number;
  rejectVelMult?: number;
  moveImpulsePointY?: number;
  camFollowMult?: number;
  camLerpMult?: number;
  fallingGravityScale?: number;
  fallingMaxVel?: number;
  wakeUpDelay?: number;
  // Floating Ray setups
  rayOriginOffest?: { x: number; y: number; z: number };
  rayHitForgiveness?: number;
  rayLength?: number;
  rayDir?: { x: number; y: number; z: number };
  floatingDis?: number;
  springK?: number;
  dampingC?: number;
  // Slope Ray setups
  showSlopeRayOrigin?: boolean;
  slopeMaxAngle?: number;
  slopeRayOriginOffest?: number;
  slopeRayLength?: number;
  slopeRayDir?: { x: number; y: number; z: number };
  slopeUpExtraForce?: number;
  slopeDownExtraForce?: number;
  // Head Ray setups
  showHeadRayOrigin?: boolean;
  headRayOriginOffest?: number;
  headRayLength?: number;
  headRayDir?: { x: number; y: number; z: number };
  // AutoBalance Force setups
  autoBalance?: boolean;
  autoBalanceSpringK?: number;
  autoBalanceDampingC?: number;
  autoBalanceSpringOnY?: number;
  autoBalanceDampingOnY?: number;
  // Animation temporary setups
  animated?: boolean;
  // Mode setups
  mode?: string | null;
  // Controller setups
  controllerKeys?: {
    forward?: number;
    backward?: number;
    leftward?: number;
    rightward?: number;
    jump?: number;
    action1?: number;
    action2?: number;
    action3?: number;
    action4?: number;
  };
  // Point-to-move setups
  bodySensorSize?: number[];
  bodySensorPosition?: { x: number; y: number; z: number };
  // Other rigibody props from parent
  props?: RigidBodyProps;
}

export interface UserDataType {
  canJump?: boolean;
  slopeAngle?: number | null;
  characterRotated?: boolean;
  isOnMovingObject?: boolean;
  excludeEcctrlRay?: boolean;
}
