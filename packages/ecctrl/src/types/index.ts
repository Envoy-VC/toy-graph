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
