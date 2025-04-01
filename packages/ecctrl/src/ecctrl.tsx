import { QueryFilterFlags } from '@dimforge/rapier3d-compat';
import type {
  Collider,
  RayColliderHit,
  Vector,
} from '@dimforge/rapier3d-compat';
import { useKeyboardControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import {
  CapsuleCollider,
  CylinderCollider,
  RigidBody,
  quat,
  useRapier,
} from '@react-three/rapier';
import { useControls } from 'leva';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as THREE from 'three';
import { getMovingDirection } from './helpers';
import { useFollowCamera } from './hooks';
import { useGame, useJoystickControls } from './stores';
import type {
  EcctrlProps,
  EcctrlRigidBodyRef,
  UseFollowCameraProps,
  UserDataType,
} from './types';

export { EcctrlAnimation } from './animation';
export { EcctrlJoystick } from './joystick';

const Ecctrl = forwardRef<EcctrlRigidBodyRef, EcctrlProps>(
  (
    {
      children,
      debug = false,
      capsuleHalfHeight = 0.35,
      capsuleRadius = 0.3,
      floatHeight = 0.3,
      characterInitDir = 0, // in rad
      followLight = false,
      disableControl = false,
      disableFollowCam = false,
      disableFollowCamPos = null,
      disableFollowCamTarget = null,
      // Follow camera setups
      camInitDis = -5,
      camMaxDis = -7,
      camMinDis = -0.7,
      camUpLimit = 1.5, // in rad
      camLowLimit = -1.3, // in rad
      camInitDir = { x: 0, y: 0 }, // in rad
      camTargetPos = { x: 0, y: 0, z: 0 },
      camMoveSpeed = 1,
      camZoomSpeed = 1,
      camCollision = true,
      camCollisionOffset = 0.7,
      camCollisionSpeedMult = 4,
      fixedCamRotMult = 1,
      camListenerTarget = 'domElement', // document or domElement
      // Follow light setups
      followLightPos = { x: 20, y: 30, z: 10 },
      // Base control setups
      maxVelLimit = 2.5,
      turnVelMultiplier = 0.2,
      turnSpeed = 15,
      sprintMult = 2,
      jumpVel = 4,
      jumpForceToGroundMult = 5,
      slopJumpMult = 0.25,
      sprintJumpMult = 1.2,
      airDragMultiplier = 0.2,
      dragDampingC = 0.15,
      accDeltaTime = 8,
      rejectVelMult = 4,
      moveImpulsePointY = 0.5,
      camFollowMult = 11,
      camLerpMult = 25,
      fallingGravityScale = 2.5,
      fallingMaxVel = -20,
      wakeUpDelay = 200,
      // Floating Ray setups
      rayOriginOffest = { x: 0, y: -capsuleHalfHeight, z: 0 },
      rayHitForgiveness = 0.1,
      rayLength = capsuleRadius + 2,
      rayDir = { x: 0, y: -1, z: 0 },
      floatingDis = capsuleRadius + floatHeight,
      springK = 1.2,
      dampingC = 0.08,
      // Slope Ray setups
      showSlopeRayOrigin = false,
      slopeMaxAngle = 1, // in rad
      slopeRayOriginOffest = capsuleRadius - 0.03,
      slopeRayLength = capsuleRadius + 3,
      slopeRayDir = { x: 0, y: -1, z: 0 },
      slopeUpExtraForce = 0.1,
      slopeDownExtraForce = 0.2,
      // AutoBalance Force setups
      autoBalance = true,
      autoBalanceSpringK = 0.3,
      autoBalanceDampingC = 0.03,
      autoBalanceSpringOnY = 0.5,
      autoBalanceDampingOnY = 0.015,
      // Animation temporary setups
      animated = false,
      // Mode setups
      mode = null,
      // Controller setups
      controllerKeys = {
        forward: 12,
        backward: 13,
        leftward: 14,
        rightward: 15,
        jump: 2,
        action1: 11,
        action2: 3,
        action3: 1,
        action4: 0,
      },
      // Point-to-move setups
      bodySensorSize = [capsuleHalfHeight / 2, capsuleRadius],
      bodySensorPosition = { x: 0, y: 0, z: capsuleRadius / 2 },
      // Other rigibody props from parent
      ...props
    }: EcctrlProps,
    ref
  ) => {
    const characterRef = useRef<EcctrlRigidBodyRef>(null);
    // biome-ignore lint/style/noNonNullAssertion: safe
    const characterModelRef = useRef<THREE.Group>(null!);
    const characterModelIndicator: THREE.Object3D = useMemo(
      () => new THREE.Object3D(),
      []
    );

    const defaultControllerKeys = {
      forward: 12,
      backward: 13,
      leftward: 14,
      rightward: 15,
      jump: 2,
      action1: 11,
      action2: 3,
      action3: 1,
      action4: 0,
    };

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useImperativeHandle(
      ref,
      // @ts-ignore
      () => {
        if (characterRef.current) {
          characterRef.current.rotateCamera = rotateCamera;
          characterRef.current.rotateCharacterOnY = rotateCharacterOnY;
          return characterRef.current;
        }
        return null;
      },
      [characterRef.current]
    );

    /**
     * Mode setup
     */
    let isModePointToMove = false;
    let functionKeyDown = false;
    let isModeFixedCamera = false;
    let isModeCameraBased = false;
    const setMoveToPoint = useGame((state) => state.setMoveToPoint);
    const findMode = (mode: string, modes: string) =>
      modes.split(' ').some((m) => m === mode);
    if (mode) {
      if (findMode('PointToMove', mode)) isModePointToMove = true;
      if (findMode('FixedCamera', mode)) isModeFixedCamera = true;
      if (findMode('CameraBasedMovement', mode)) isModeCameraBased = true;
    }

    /**
     * Body collider setup
     */
    const modelFacingVec: THREE.Vector3 = useMemo(
      () => new THREE.Vector3(),
      []
    );
    const bodyFacingVec: THREE.Vector3 = useMemo(() => new THREE.Vector3(), []);
    const bodyBalanceVec: THREE.Vector3 = useMemo(
      () => new THREE.Vector3(),
      []
    );
    const bodyBalanceVecOnX: THREE.Vector3 = useMemo(
      () => new THREE.Vector3(),
      []
    );
    const bodyFacingVecOnY: THREE.Vector3 = useMemo(
      () => new THREE.Vector3(),
      []
    );
    const bodyBalanceVecOnZ: THREE.Vector3 = useMemo(
      () => new THREE.Vector3(),
      []
    );
    const vectorY: THREE.Vector3 = useMemo(
      () => new THREE.Vector3(0, 1, 0),
      []
    );
    const vectorZ: THREE.Vector3 = useMemo(
      () => new THREE.Vector3(0, 0, 1),
      []
    );
    const crossVecOnX: THREE.Vector3 = useMemo(() => new THREE.Vector3(), []);
    const crossVecOnY: THREE.Vector3 = useMemo(() => new THREE.Vector3(), []);
    const crossVecOnZ: THREE.Vector3 = useMemo(() => new THREE.Vector3(), []);
    const bodyContactForce: THREE.Vector3 = useMemo(
      () => new THREE.Vector3(),
      []
    );
    const slopeRayOriginUpdatePosition: THREE.Vector3 = useMemo(
      () => new THREE.Vector3(),
      []
    );
    const camBasedMoveCrossVecOnY: THREE.Vector3 = useMemo(
      () => new THREE.Vector3(),
      []
    );

    // Animation change functions
    const idleAnimation = useGame((state) => state.idle);
    const walkAnimation = useGame((state) => state.walk);
    const runAnimation = useGame((state) => state.run);
    const jumpAnimation = useGame((state) => state.jump);
    const jumpIdleAnimation = useGame((state) => state.jumpIdle);
    const fallAnimation = useGame((state) => state.fall);
    const action1Animation = useGame((state) => state.action1);
    const action2Animation = useGame((state) => state.action2);
    const action3Animation = useGame((state) => state.action3);
    const action4Animation = useGame((state) => state.action4);

    /**
     * Debug settings
     */
    const characterControlsDebug = useControls(
      'Character Controls',
      {
        maxVelLimit: {
          value: maxVelLimit,
          min: 0,
          max: 10,
          step: 0.01,
        },
        turnVelMultiplier: {
          value: turnVelMultiplier,
          min: 0,
          max: 1,
          step: 0.01,
        },
        turnSpeed: {
          value: turnSpeed,
          min: 5,
          max: 30,
          step: 0.1,
        },
        sprintMult: {
          value: sprintMult,
          min: 1,
          max: 5,
          step: 0.01,
        },
        jumpVel: {
          value: jumpVel,
          min: 0,
          max: 10,
          step: 0.01,
        },
        jumpForceToGroundMult: {
          value: jumpForceToGroundMult,
          min: 0,
          max: 80,
          step: 0.1,
        },
        slopJumpMult: {
          value: slopJumpMult,
          min: 0,
          max: 1,
          step: 0.01,
        },
        sprintJumpMult: {
          value: sprintJumpMult,
          min: 1,
          max: 3,
          step: 0.01,
        },
        airDragMultiplier: {
          value: airDragMultiplier,
          min: 0,
          max: 1,
          step: 0.01,
        },
        dragDampingC: {
          value: dragDampingC,
          min: 0,
          max: 0.5,
          step: 0.01,
        },
        accDeltaTime: {
          value: accDeltaTime,
          min: 0,
          max: 50,
          step: 1,
        },
        rejectVelMult: {
          value: rejectVelMult,
          min: 0,
          max: 10,
          step: 0.1,
        },
        moveImpulsePointY: {
          value: moveImpulsePointY,
          min: 0,
          max: 3,
          step: 0.1,
        },
        camFollowMult: {
          value: camFollowMult,
          min: 0,
          max: 15,
          step: 0.1,
        },
      },
      { collapsed: true }
    );
    // Apply debug values
    maxVelLimit = characterControlsDebug.maxVelLimit;
    turnVelMultiplier = characterControlsDebug.turnVelMultiplier;
    turnSpeed = characterControlsDebug.turnSpeed;
    sprintMult = characterControlsDebug.sprintMult;
    jumpVel = characterControlsDebug.jumpVel;
    jumpForceToGroundMult = characterControlsDebug.jumpForceToGroundMult;
    slopJumpMult = characterControlsDebug.slopJumpMult;
    sprintJumpMult = characterControlsDebug.sprintJumpMult;
    airDragMultiplier = characterControlsDebug.airDragMultiplier;
    dragDampingC = characterControlsDebug.dragDampingC;
    accDeltaTime = characterControlsDebug.accDeltaTime;
    rejectVelMult = characterControlsDebug.rejectVelMult;
    moveImpulsePointY = characterControlsDebug.moveImpulsePointY;
    camFollowMult = characterControlsDebug.camFollowMult;

    // Floating Ray
    const floatingRayDebug = useControls(
      'Floating Ray',
      {
        rayOriginOffest: {
          x: 0,
          y: -capsuleHalfHeight,
          z: 0,
        },
        rayHitForgiveness: {
          value: rayHitForgiveness,
          min: 0,
          max: 0.5,
          step: 0.01,
        },
        rayLength: {
          value: capsuleRadius + 2,
          min: 0,
          max: capsuleRadius + 10,
          step: 0.01,
        },
        rayDir: { x: 0, y: -1, z: 0 },
        floatingDis: {
          value: capsuleRadius + floatHeight,
          min: 0,
          max: capsuleRadius + 2,
          step: 0.01,
        },
        springK: {
          value: springK,
          min: 0,
          max: 5,
          step: 0.01,
        },
        dampingC: {
          value: dampingC,
          min: 0,
          max: 3,
          step: 0.01,
        },
      },
      { collapsed: true }
    );
    // Apply debug values
    rayOriginOffest = floatingRayDebug.rayOriginOffest;
    rayHitForgiveness = floatingRayDebug.rayHitForgiveness;
    rayLength = floatingRayDebug.rayLength;
    rayDir = floatingRayDebug.rayDir;
    floatingDis = floatingRayDebug.floatingDis;
    springK = floatingRayDebug.springK;
    dampingC = floatingRayDebug.dampingC;

    // Slope Ray
    const slopeRayDebug = useControls(
      'Slope Ray',
      {
        showSlopeRayOrigin: false,
        slopeMaxAngle: {
          value: slopeMaxAngle,
          min: 0,
          max: 1.57,
          step: 0.01,
        },
        slopeRayOriginOffest: {
          value: capsuleRadius,
          min: 0,
          max: capsuleRadius + 3,
          step: 0.01,
        },
        slopeRayLength: {
          value: capsuleRadius + 3,
          min: 0,
          max: capsuleRadius + 13,
          step: 0.01,
        },
        slopeRayDir: { x: 0, y: -1, z: 0 },
        slopeUpExtraForce: {
          value: slopeUpExtraForce,
          min: 0,
          max: 5,
          step: 0.01,
        },
        slopeDownExtraForce: {
          value: slopeDownExtraForce,
          min: 0,
          max: 5,
          step: 0.01,
        },
      },
      { collapsed: true }
    );
    // Apply debug values
    showSlopeRayOrigin = slopeRayDebug.showSlopeRayOrigin;
    slopeMaxAngle = slopeRayDebug.slopeMaxAngle;
    slopeRayLength = slopeRayDebug.slopeRayLength;
    slopeRayDir = slopeRayDebug.slopeRayDir;
    slopeUpExtraForce = slopeRayDebug.slopeUpExtraForce;
    slopeDownExtraForce = slopeRayDebug.slopeDownExtraForce;

    // AutoBalance Force
    const autoBalanceForceDebug = useControls(
      'AutoBalance Force',
      {
        autoBalance: {
          value: true,
        },
        autoBalanceSpringK: {
          value: autoBalanceSpringK,
          min: 0,
          max: 5,
          step: 0.01,
        },
        autoBalanceDampingC: {
          value: autoBalanceDampingC,
          min: 0,
          max: 0.1,
          step: 0.001,
        },
        autoBalanceSpringOnY: {
          value: autoBalanceSpringOnY,
          min: 0,
          max: 5,
          step: 0.01,
        },
        autoBalanceDampingOnY: {
          value: autoBalanceDampingOnY,
          min: 0,
          max: 0.1,
          step: 0.001,
        },
      },
      { collapsed: true }
    );

    // Apply debug values
    autoBalance = autoBalanceForceDebug.autoBalance;
    autoBalanceSpringK = autoBalanceForceDebug.autoBalanceSpringK;
    autoBalanceDampingC = autoBalanceForceDebug.autoBalanceDampingC;
    autoBalanceSpringOnY = autoBalanceForceDebug.autoBalanceSpringOnY;
    autoBalanceDampingOnY = autoBalanceForceDebug.autoBalanceDampingOnY;

    /**
     * Check if inside keyboard controls
     */
    function useIsInsideKeyboardControls() {
      try {
        // biome-ignore lint/correctness/useHookAtTopLevel: temp
        return Boolean(useKeyboardControls());
      } catch {
        return false;
      }
    }
    const isInsideKeyboardControls = useIsInsideKeyboardControls();

    /**
     * keyboard controls setup
     */
    const [subscribeKeys, getKeys] = isInsideKeyboardControls
      ? // biome-ignore lint/correctness/useHookAtTopLevel: safe
        useKeyboardControls()
      : [null];

    const presetKeys = {
      forward: false,
      backward: false,
      leftward: false,
      rightward: false,
      jump: false,
      run: false,
    };

    const { rapier, world } = useRapier();

    /**
     * Joystick controls setup
     */
    const getJoystickValues = useJoystickControls(
      (state) => state.getJoystickValues
    );
    const pressButton1 = useJoystickControls((state) => state.pressButton1);
    const pressButton2 = useJoystickControls((state) => state.pressButton2);
    const pressButton3 = useJoystickControls((state) => state.pressButton3);
    const pressButton4 = useJoystickControls((state) => state.pressButton4);
    const pressButton5 = useJoystickControls((state) => state.pressButton5);
    const releaseAllButtons = useJoystickControls(
      (state) => state.releaseAllButtons
    );
    const setJoystick = useJoystickControls((state) => state.setJoystick);
    const resetJoystick = useJoystickControls((state) => state.resetJoystick);

    /**
     * Gamepad controls setup
     */
    const [controllerIndex, setControllerIndex] = useState<number | null>(null);
    const gamepadKeys = {
      forward: false,
      backward: false,
      leftward: false,
      rightward: false,
    };
    const gamepadJoystickVec2: THREE.Vector2 = useMemo(
      () => new THREE.Vector2(),
      []
    );
    let gamepadJoystickDis = 0;
    let gamepadJoystickAng = 0;

    // biome-ignore lint/suspicious/noExplicitAny: safe
    const gamepadConnect = (e: any) => {
      setControllerIndex(e.gamepad.index);
    };
    const gamepadDisconnect = () => {
      setControllerIndex(null);
    };

    const mergedKeys = useMemo(
      () => Object.assign({}, defaultControllerKeys, controllerKeys),
      [controllerKeys]
    );
    const handleButtons = (buttons: readonly GamepadButton[]) => {
      gamepadKeys.forward = buttons[mergedKeys.forward]?.pressed ?? false;
      gamepadKeys.backward = buttons[mergedKeys.backward]?.pressed ?? false;
      gamepadKeys.leftward = buttons[mergedKeys.leftward]?.pressed ?? false;
      gamepadKeys.rightward = buttons[mergedKeys.rightward]?.pressed ?? false;

      // Gamepad trigger the EcctrlJoystick buttons to play animations
      if (buttons[mergedKeys.action4]?.pressed ?? false) {
        pressButton2();
      } else if (buttons[mergedKeys.action3]?.pressed ?? false) {
        pressButton4();
      } else if (buttons[mergedKeys.jump]?.pressed ?? false) {
        pressButton1();
      } else if (buttons[mergedKeys.action2]?.pressed ?? false) {
        pressButton3();
      } else if (buttons[mergedKeys.action1]?.pressed ?? false) {
        pressButton5();
      } else {
        releaseAllButtons();
      }
    };

    const handleSticks = (axes: readonly number[]) => {
      const x = axes[0] as number;
      const y = axes[1] as number;
      const z = axes[2] as number;
      // Gamepad first joystick trigger the EcctrlJoystick event to move the character
      if (Math.abs(x) > 0 || Math.abs(y) > 0) {
        gamepadJoystickVec2.set(x, -y);
        gamepadJoystickDis = Math.min(
          Math.sqrt(gamepadJoystickVec2.x ** 2 + gamepadJoystickVec2.y ** 2),
          1
        );
        gamepadJoystickAng = gamepadJoystickVec2.angle();
        const runState = gamepadJoystickDis > 0.7;
        setJoystick(gamepadJoystickDis, gamepadJoystickAng, runState);
      } else {
        gamepadJoystickDis = 0;
        gamepadJoystickAng = 0;
        resetJoystick();
      }
      // Gamepad second joystick trigger the useFollowCam event to move the camera
      if (Math.abs(y) > 0 || Math.abs(z) > 0) {
        joystickCamMove(y, z);
      }
    };

    // can jump setup
    let canJump = false;
    let isFalling = false;

    const initialGravityScale = useMemo(
      () => props.gravityScale ?? 1,
      [props.gravityScale]
    );

    // on moving object state
    let massRatio = 1;
    let isOnMovingObject = false;

    const standingForcePoint: THREE.Vector3 = useMemo(
      () => new THREE.Vector3(),
      []
    );
    const movingObjectDragForce: THREE.Vector3 = useMemo(
      () => new THREE.Vector3(),
      []
    );
    const movingObjectVelocity: THREE.Vector3 = useMemo(
      () => new THREE.Vector3(),
      []
    );
    const movingObjectVelocityInCharacterDir: THREE.Vector3 = useMemo(
      () => new THREE.Vector3(),
      []
    );
    const distanceFromCharacterToObject: THREE.Vector3 = useMemo(
      () => new THREE.Vector3(),
      []
    );
    const objectAngvelToLinvel: THREE.Vector3 = useMemo(
      () => new THREE.Vector3(),
      []
    );
    const velocityDiff: THREE.Vector3 = useMemo(() => new THREE.Vector3(), []);

    /**
     * Initial light setup
     */
    let dirLight: THREE.DirectionalLight | null = null;

    /**
     * Follow camera initial setups from props
     */
    const cameraSetups: UseFollowCameraProps = {
      disableFollowCam,
      disableFollowCamPos: disableFollowCamPos ?? undefined,
      disableFollowCamTarget: disableFollowCamTarget ?? undefined,
      camInitDis,
      camMaxDis,
      camMinDis,
      camUpLimit,
      camLowLimit,
      camInitDir,
      camMoveSpeed: isModeFixedCamera ? 0 : camMoveSpeed, // Disable camera move in fixed camera mode
      camZoomSpeed: isModeFixedCamera ? 0 : camZoomSpeed, // Disable camera zoom in fixed camera mode
      camCollisionOffset,
      camCollisionSpeedMult,
      camListenerTarget,
    };

    /**
     * Load camera pivot and character move preset
     */
    const { pivot, followCam, cameraCollisionDetect, joystickCamMove } =
      useFollowCamera(cameraSetups);
    const pivotPosition: THREE.Vector3 = useMemo(() => new THREE.Vector3(), []);
    const pivotXAxis: THREE.Vector3 = useMemo(
      () => new THREE.Vector3(1, 0, 0),
      []
    );
    const pivotYAxis: THREE.Vector3 = useMemo(
      () => new THREE.Vector3(0, 1, 0),
      []
    );
    const pivotZAxis: THREE.Vector3 = useMemo(
      () => new THREE.Vector3(0, 0, 1),
      []
    );
    const followCamPosition: THREE.Vector3 = useMemo(
      () => new THREE.Vector3(),
      []
    );
    const modelEuler: THREE.Euler = useMemo(() => new THREE.Euler(), []);
    const modelQuat: THREE.Quaternion = useMemo(
      () => new THREE.Quaternion(),
      []
    );
    const moveImpulse: THREE.Vector3 = useMemo(() => new THREE.Vector3(), []);
    const movingDirection: THREE.Vector3 = useMemo(
      () => new THREE.Vector3(),
      []
    );
    const moveAccNeeded: THREE.Vector3 = useMemo(() => new THREE.Vector3(), []);
    const jumpVelocityVec: THREE.Vector3 = useMemo(
      () => new THREE.Vector3(),
      []
    );
    const jumpDirection: THREE.Vector3 = useMemo(() => new THREE.Vector3(), []);
    const currentVel: THREE.Vector3 = useMemo(() => new THREE.Vector3(), []);
    const currentPos: THREE.Vector3 = useMemo(() => new THREE.Vector3(), []);
    const dragForce: THREE.Vector3 = useMemo(() => new THREE.Vector3(), []);
    const dragAngForce: THREE.Vector3 = useMemo(() => new THREE.Vector3(), []);
    const wantToMoveVel: THREE.Vector3 = useMemo(() => new THREE.Vector3(), []);
    const rejectVel: THREE.Vector3 = useMemo(() => new THREE.Vector3(), []);

    /**
     * Floating Ray setup
     */
    let floatingForce = null;
    const springDirVec: THREE.Vector3 = useMemo(() => new THREE.Vector3(), []);
    const characterMassForce: THREE.Vector3 = useMemo(
      () => new THREE.Vector3(),
      []
    );
    const rayOrigin: THREE.Vector3 = useMemo(() => new THREE.Vector3(), []);
    const rayCast = new rapier.Ray(rayOrigin, rayDir);
    let rayHit: RayColliderHit | null = null;

    /**Test shape ray */
    // const shape = new rapier.Capsule(0.2,0.1)

    /**
     * Slope detection ray setup
     */
    let slopeAngle: number | null = null;
    let actualSlopeNormal: Vector | null = null;
    let actualSlopeAngle: number | null = null;
    const actualSlopeNormalVec: THREE.Vector3 = useMemo(
      () => new THREE.Vector3(),
      []
    );
    const floorNormal: THREE.Vector3 = useMemo(
      () => new THREE.Vector3(0, 1, 0),
      []
    );
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    const slopeRayOriginRef = useRef<THREE.Mesh>(null!);
    const slopeRayorigin: THREE.Vector3 = useMemo(
      () => new THREE.Vector3(),
      []
    );
    const slopeRayCast = new rapier.Ray(slopeRayorigin, slopeRayDir);
    let slopeRayHit: RayColliderHit | null = null;

    /**
     * Point to move setup
     */
    let isBodyHitWall = false;
    let isPointMoving = false;
    const crossVector: THREE.Vector3 = useMemo(() => new THREE.Vector3(), []);
    const pointToPoint: THREE.Vector3 = useMemo(() => new THREE.Vector3(), []);
    const getMoveToPoint = useGame((state) => state.getMoveToPoint);
    // biome-ignore lint/style/noNonNullAssertion: safe
    const bodySensorRef = useRef<Collider>(null!);
    const handleOnIntersectionEnter = () => {
      isBodyHitWall = true;
    };
    const handleOnIntersectionExit = () => {
      isBodyHitWall = false;
    };

    /**
     * Character moving function
     */
    let characterRotated = true;
    const moveCharacter = (
      _: number,
      run: boolean,
      slopeAngle: number,
      movingObjectVelocity: THREE.Vector3
      // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: safe
    ) => {
      /**
       * Setup moving direction
       */
      // Only apply slope angle to moving direction
      // when slope angle is between 0.2rad and slopeMaxAngle,
      // and actualSlopeAngle < slopeMaxAngle
      const actualAngle = actualSlopeAngle ?? 0;
      if (
        actualAngle < slopeMaxAngle &&
        Math.abs(slopeAngle) > 0.2 &&
        Math.abs(slopeAngle) < slopeMaxAngle
      ) {
        movingDirection.set(0, Math.sin(slopeAngle), Math.cos(slopeAngle));
      }
      // If on a slopeMaxAngle slope, only apply small a mount of forward direction
      else if (actualAngle >= slopeMaxAngle) {
        movingDirection.set(
          0,
          Math.sin(slopeAngle) > 0 ? 0 : Math.sin(slopeAngle),
          Math.sin(slopeAngle) > 0 ? 0.1 : 1
        );
      } else {
        movingDirection.set(0, 0, 1);
      }

      // Apply character quaternion to moving direction
      movingDirection.applyQuaternion(characterModelIndicator.quaternion);

      /**
       * Moving object conditions
       */
      // Calculate moving object velocity direction according to character moving direction
      movingObjectVelocityInCharacterDir
        .copy(movingObjectVelocity)
        .projectOnVector(movingDirection)
        .multiply(movingDirection);
      // Calculate angle between moving object velocity direction and character moving direction
      const angleBetweenCharacterDirAndObjectDir =
        movingObjectVelocity.angleTo(movingDirection);

      /**
       * Setup rejection velocity, (currently only work on ground)
       */
      const wantToMoveMeg = currentVel.dot(movingDirection);
      wantToMoveVel.set(
        movingDirection.x * wantToMoveMeg,
        0,
        movingDirection.z * wantToMoveMeg
      );
      rejectVel.copy(currentVel).sub(wantToMoveVel);

      /**
       * Calculate required accelaration and force: a = Δv/Δt
       * If it's on a moving/rotating platform, apply platform velocity to Δv accordingly
       * Also, apply reject velocity when character is moving opposite of it's moving direction
       */
      moveAccNeeded.set(
        (movingDirection.x *
          (maxVelLimit * (run ? sprintMult : 1) +
            movingObjectVelocityInCharacterDir.x) -
          (currentVel.x -
            movingObjectVelocity.x *
              Math.sin(angleBetweenCharacterDirAndObjectDir) +
            rejectVel.x * (isOnMovingObject ? 0 : rejectVelMult))) /
          accDeltaTime,
        0,
        (movingDirection.z *
          (maxVelLimit * (run ? sprintMult : 1) +
            movingObjectVelocityInCharacterDir.z) -
          (currentVel.z -
            movingObjectVelocity.z *
              Math.sin(angleBetweenCharacterDirAndObjectDir) +
            rejectVel.z * (isOnMovingObject ? 0 : rejectVelMult))) /
          accDeltaTime
      );

      // Wanted to move force function: F = ma
      const moveForceNeeded = moveAccNeeded.multiplyScalar(
        characterRef.current?.mass() ?? 1
      );

      /**
       * Check if character complete turned to the wanted direction
       */
      characterRotated =
        Math.sin(characterModelIndicator.rotation.y).toFixed(3) ===
        Math.sin(modelEuler.y).toFixed(3);

      // If character hasn't complete turning, change the impulse quaternion follow characterModelIndicator quaternion
      if (characterRotated) {
        moveImpulse.set(
          moveForceNeeded.x * (canJump ? 1 : airDragMultiplier),
          slopeAngle === null || slopeAngle === 0 // if it's on a slope, apply extra up/down force to the body
            ? 0
            : movingDirection.y *
                (movingDirection.y > 0 // check it is on slope up or slope down
                  ? slopeUpExtraForce
                  : slopeDownExtraForce) *
                (run ? sprintMult : 1),
          moveForceNeeded.z * (canJump ? 1 : airDragMultiplier)
        );
      } else {
        moveImpulse.set(
          moveForceNeeded.x *
            turnVelMultiplier *
            (canJump ? 1 : airDragMultiplier), // if it's in the air, give it less control
          slopeAngle === null || slopeAngle === 0 // if it's on a slope, apply extra up/down force to the body
            ? 0
            : movingDirection.y *
                turnVelMultiplier *
                (movingDirection.y > 0 // check it is on slope up or slope down
                  ? slopeUpExtraForce
                  : slopeDownExtraForce) *
                (run ? sprintMult : 1),
          moveForceNeeded.z *
            turnVelMultiplier *
            (canJump ? 1 : airDragMultiplier) // if it's in the air, give it less control
        );
      }

      // Move character at proper direction and impulse
      characterRef.current?.applyImpulseAtPoint(
        moveImpulse,
        {
          x: currentPos.x,
          y: currentPos.y + moveImpulsePointY,
          z: currentPos.z,
        },
        true
      );
    };

    /**
     * Character auto balance function
     */
    const autoBalanceCharacter = () => {
      // Match body component to character model rotation on Y
      bodyFacingVec
        .set(0, 0, 1)
        .applyQuaternion(quat(characterRef.current?.rotation()));
      bodyBalanceVec
        .set(0, 1, 0)
        .applyQuaternion(quat(characterRef.current?.rotation()));

      bodyBalanceVecOnX.set(0, bodyBalanceVec.y, bodyBalanceVec.z);
      bodyFacingVecOnY.set(bodyFacingVec.x, 0, bodyFacingVec.z);
      bodyBalanceVecOnZ.set(bodyBalanceVec.x, bodyBalanceVec.y, 0);

      // Check if is camera based movement
      if (isModeCameraBased) {
        modelEuler.y = pivot.rotation.y;
        pivot.getWorldDirection(modelFacingVec);
        // Update slopeRayOrigin to new positon
        slopeRayOriginUpdatePosition.set(
          movingDirection.x,
          0,
          movingDirection.z
        );
        camBasedMoveCrossVecOnY
          .copy(slopeRayOriginUpdatePosition)
          .cross(modelFacingVec);
        slopeRayOriginRef.current.position.x =
          slopeRayOriginOffest *
          Math.sin(
            slopeRayOriginUpdatePosition.angleTo(modelFacingVec) *
              (camBasedMoveCrossVecOnY.y < 0 ? 1 : -1)
          );
        slopeRayOriginRef.current.position.z =
          slopeRayOriginOffest *
          Math.cos(
            slopeRayOriginUpdatePosition.angleTo(modelFacingVec) *
              (camBasedMoveCrossVecOnY.y < 0 ? 1 : -1)
          );
      } else {
        characterModelIndicator.getWorldDirection(modelFacingVec);
      }
      crossVecOnX.copy(vectorY).cross(bodyBalanceVecOnX);
      crossVecOnY.copy(modelFacingVec).cross(bodyFacingVecOnY);
      crossVecOnZ.copy(vectorY).cross(bodyBalanceVecOnZ);

      dragAngForce.set(
        (crossVecOnX.x < 0 ? 1 : -1) *
          autoBalanceSpringK *
          bodyBalanceVecOnX.angleTo(vectorY) -
          (characterRef.current?.angvel().x ?? 0) * autoBalanceDampingC,
        (crossVecOnY.y < 0 ? 1 : -1) *
          autoBalanceSpringOnY *
          modelFacingVec.angleTo(bodyFacingVecOnY) -
          (characterRef.current?.angvel().y ?? 0) * autoBalanceDampingOnY,
        (crossVecOnZ.z < 0 ? 1 : -1) *
          autoBalanceSpringK *
          bodyBalanceVecOnZ.angleTo(vectorY) -
          (characterRef.current?.angvel().z ?? 0) * autoBalanceDampingC
      );

      // Apply balance torque impulse
      characterRef.current?.applyTorqueImpulse(dragAngForce, true);
    };

    /**
     * Character sleep function
     */
    const sleepCharacter = () => {
      if (characterRef.current) {
        if (document.visibilityState === 'hidden') {
          characterRef.current.sleep();
        } else {
          setTimeout(() => {
            characterRef.current?.wakeUp();
          }, wakeUpDelay);
        }
      }
    };

    /**
     * Point-to-move function
     */
    const pointToMove = (
      delta: number,
      slopeAngle: number,
      movingObjectVelocity: THREE.Vector3,
      functionKeyDown: boolean
    ) => {
      const moveToPoint = getMoveToPoint().moveToPoint;
      if (moveToPoint) {
        pointToPoint.set(
          moveToPoint.x - currentPos.x,
          0,
          moveToPoint.z - currentPos.z
        );
        crossVector.crossVectors(pointToPoint, vectorZ);
        // Rotate character to moving direction
        modelEuler.y =
          (crossVector.y > 0 ? -1 : 1) * pointToPoint.angleTo(vectorZ);
        // If mode is also set to fixed camera. keep the camera on the back of character
        if (isModeFixedCamera)
          pivot.rotation.y = THREE.MathUtils.lerp(
            pivot.rotation.y,
            modelEuler.y,
            fixedCamRotMult * delta * 3
          );
        // Once character close to the target point (distance<0.3),
        // Or character close to the wall (bodySensor intersects)
        // stop moving
        if (characterRef.current) {
          if (
            pointToPoint.length() > 0.3 &&
            !isBodyHitWall &&
            !functionKeyDown
          ) {
            moveCharacter(delta, false, slopeAngle, movingObjectVelocity);
            isPointMoving = true;
          } else {
            setMoveToPoint(null);
            isPointMoving = false;
          }
        }
      }
    };

    /**
     * Rotate camera function
     */
    const rotateCamera = (x: number, y: number) => {
      pivot.rotation.y += y;
      followCam.rotation.x = Math.min(
        Math.max(followCam.rotation.x + x, camLowLimit),
        camUpLimit
      );
    };

    /**
     * Rotate character on Y function
     */
    const rotateCharacterOnY = (rad: number) => {
      modelEuler.y += rad;
    };

    useEffect(() => {
      // Initialize directional light
      if (followLight) {
        dirLight = characterModelRef.current.parent?.parent?.children.find(
          (item) => {
            return item.name === 'followLight';
          }
        ) as THREE.DirectionalLight;
      }
    });

    /**
     * Keyboard controls subscribe setup
     */
    // If inside keyboardcontrols, active subscribeKeys
    if (isInsideKeyboardControls) {
      // biome-ignore lint/correctness/useHookAtTopLevel: <explanation>
      useEffect(() => {
        // Action 1 key subscribe for special animation
        const unSubscribeAction1 = subscribeKeys?.(
          (state) => state.action1,
          (value) => {
            if (value) {
              animated && action1Animation?.();
            }
          }
        );

        // Action 2 key subscribe for special animation
        const unSubscribeAction2 = subscribeKeys?.(
          (state) => state.action2,
          (value) => {
            if (value) {
              animated && action2Animation?.();
            }
          }
        );

        // Action 3 key subscribe for special animation
        const unSubscribeAction3 = subscribeKeys?.(
          (state) => state.action3,
          (value) => {
            if (value) {
              animated && action3Animation?.();
            }
          }
        );

        // Trigger key subscribe for special animation
        const unSubscribeAction4 = subscribeKeys?.(
          (state) => state.action4,
          (value) => {
            if (value) {
              animated && action4Animation?.();
            }
          }
        );

        return () => {
          unSubscribeAction1?.();
          unSubscribeAction2?.();
          unSubscribeAction3?.();
          unSubscribeAction4?.();
        };
      });
    }

    /**
     * Joystick subscribe setup
     */
    useEffect(() => {
      // Subscribe button 2
      const unSubPressButton2 = useJoystickControls.subscribe(
        (state) => state.curButton2Pressed,
        (value) => {
          if (value) {
            animated && action4Animation?.();
          }
        }
      );

      // Subscribe button 3
      const unSubPressButton3 = useJoystickControls.subscribe(
        (state) => state.curButton3Pressed,
        (value) => {
          if (value) {
            animated && action2Animation?.();
          }
        }
      );

      // Subscribe button 4
      const unSubPressButton4 = useJoystickControls.subscribe(
        (state) => state.curButton4Pressed,
        (value) => {
          if (value) {
            animated && action3Animation?.();
          }
        }
      );

      // Subscribe button 5
      const unSubPressButton5 = useJoystickControls.subscribe(
        (state) => state.curButton5Pressed,
        (value) => {
          if (value) {
            animated && action1Animation?.();
          }
        }
      );

      return () => {
        unSubPressButton2();
        unSubPressButton3();
        unSubPressButton4();
        unSubPressButton5();
      };
    });

    useEffect(() => {
      // Lock character rotations at Y axis
      characterRef.current?.setEnabledRotations(
        autoBalance,
        autoBalance,
        autoBalance,
        false
      );

      // Reset character quaternion
      return () => {
        if (characterRef.current && characterModelRef.current) {
          characterModelRef.current.quaternion.set(0, 0, 0, 1);
          characterRef.current.setRotation({ x: 0, y: 0, z: 0, w: 1 }, false);
        }
      };
    }, [autoBalance]);

    // biome-ignore lint/correctness/useExhaustiveDependencies: safe
    useEffect(() => {
      // Initialize character facing direction
      modelEuler.y = characterInitDir;

      window.addEventListener('visibilitychange', sleepCharacter);
      window.addEventListener('gamepadconnected', gamepadConnect);
      window.addEventListener('gamepaddisconnected', gamepadDisconnect);

      return () => {
        window.removeEventListener('visibilitychange', sleepCharacter);
        window.removeEventListener('gamepadconnected', gamepadConnect);
        window.removeEventListener('gamepaddisconnected', gamepadDisconnect);
      };
    }, []);

    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: safe
    useFrame((state, delta) => {
      // biome-ignore lint/style/noParameterAssign: safe
      if (delta > 1) delta %= 1;

      // Character current position/velocity
      if (characterRef.current) {
        currentPos.copy(characterRef.current.translation() as THREE.Vector3);
        currentVel.copy(characterRef.current.linvel() as THREE.Vector3);
        // Assign userDate properties
        (characterRef.current.userData as UserDataType).canJump = canJump;
        (characterRef.current.userData as UserDataType).slopeAngle = slopeAngle;
        (characterRef.current.userData as UserDataType).characterRotated =
          characterRotated;
        (characterRef.current.userData as UserDataType).isOnMovingObject =
          isOnMovingObject;
      }

      /**
       * Apply character position to directional light
       */
      if (followLight && dirLight) {
        dirLight.position.x = currentPos.x + followLightPos.x;
        dirLight.position.y = currentPos.y + followLightPos.y;
        dirLight.position.z = currentPos.z + followLightPos.z;
        dirLight.target = characterModelRef.current;
      }

      /**
       * Camera movement
       */
      pivotXAxis.set(1, 0, 0);
      pivotXAxis.applyQuaternion(pivot.quaternion);
      pivotZAxis.set(0, 0, 1);
      pivotZAxis.applyQuaternion(pivot.quaternion);
      pivotPosition
        .copy(currentPos)
        .addScaledVector(pivotXAxis, camTargetPos.x)
        .addScaledVector(
          pivotYAxis,
          camTargetPos.y + (capsuleHalfHeight + capsuleRadius / 2)
        )
        .addScaledVector(pivotZAxis, camTargetPos.z);
      pivot.position.lerp(pivotPosition, 1 - Math.exp(-camFollowMult * delta));

      if (!disableFollowCam) {
        followCam.getWorldPosition(followCamPosition);
        state.camera.position.lerp(
          followCamPosition,
          1 - Math.exp(-camLerpMult * delta)
        );
        state.camera.lookAt(pivot.position);
      }

      /**
       * Camera collision detect
       */
      camCollision && cameraCollisionDetect(delta);

      /**
       * If disableControl is true, skip all following features
       */
      if (disableControl) return;

      /**
       * Getting all gamepad control values
       */
      if (controllerIndex !== null) {
        const gamepad = navigator.getGamepads()[controllerIndex];
        handleButtons(gamepad?.buttons ?? []);
        handleSticks(gamepad?.axes ?? []);
        // Getting moving directions (IIFE)
        modelEuler.y = ((movingDirection) =>
          movingDirection === null ? modelEuler.y : movingDirection)(
          getMovingDirection(
            gamepadKeys.forward,
            gamepadKeys.backward,
            gamepadKeys.leftward,
            gamepadKeys.rightward,
            pivot
          )
        );
      }

      /**
       * Getting all joystick control values
       */
      const { joystickDis, joystickAng, runState, button1Pressed } =
        getJoystickValues();

      // Move character to the moving direction (joystick controls)
      if (joystickDis > 0) {
        // Apply camera rotation to character model
        modelEuler.y = pivot.rotation.y + (joystickAng - Math.PI / 2);
        moveCharacter(delta, runState, slopeAngle ?? 0, movingObjectVelocity);
      }

      /**
       * Getting all the useful keys from useKeyboardControls
       */
      const keys = getKeys ? getKeys() : presetKeys;
      const { forward, backward, leftward, rightward, jump, run } =
        isInsideKeyboardControls ? keys : presetKeys;

      // Getting moving directions (IIFE)
      modelEuler.y = ((movingDirection) =>
        movingDirection === null ? modelEuler.y : movingDirection)(
        getMovingDirection(forward, backward, leftward, rightward, pivot)
      );

      // Move character to the moving direction
      if (
        forward ||
        backward ||
        leftward ||
        rightward ||
        gamepadKeys.forward ||
        gamepadKeys.backward ||
        gamepadKeys.leftward ||
        gamepadKeys.rightward
      )
        moveCharacter(delta, run, slopeAngle ?? 0, movingObjectVelocity);

      // Jump impulse
      if ((jump || button1Pressed) && canJump) {
        // characterRef.current.applyImpulse(jumpDirection.set(0, 0.5, 0), true);
        jumpVelocityVec.set(
          currentVel.x,
          run ? sprintJumpMult * jumpVel : jumpVel,
          currentVel.z
        );
        // Apply slope normal to jump direction
        characterRef.current?.setLinvel(
          jumpDirection
            .set(
              0,
              (run ? sprintJumpMult * jumpVel : jumpVel) * slopJumpMult,
              0
            )
            .projectOnVector(actualSlopeNormalVec)
            .add(jumpVelocityVec),
          true
        );
        // Apply jump force downward to the standing platform
        characterMassForce.y *= jumpForceToGroundMult;
        rayHit?.collider
          .parent()
          ?.applyImpulseAtPoint(characterMassForce, standingForcePoint, true);
      }

      // Rotate character Indicator
      modelQuat.setFromEuler(modelEuler);
      characterModelIndicator.quaternion.rotateTowards(
        modelQuat,
        delta * turnSpeed
      );

      // If autobalance is off, rotate character model itself
      if (!autoBalance) {
        if (isModeCameraBased) {
          characterModelRef.current.quaternion.copy(pivot.quaternion);
        } else {
          characterModelRef.current.quaternion.copy(
            characterModelIndicator.quaternion
          );
        }
      }

      /**
       * Ray casting detect if on ground
       */
      rayOrigin.addVectors(currentPos, rayOriginOffest as THREE.Vector3);
      rayHit = world.castRay(
        rayCast,
        rayLength,
        false,
        QueryFilterFlags.EXCLUDE_SENSORS,
        undefined,
        undefined,
        characterRef.current ?? undefined,
        // this exclude any collider with userData: excludeEcctrlRay
        (collider: Collider) => {
          const userData = collider.parent()?.userData as UserDataType;
          const excludeEcctrlRay = userData?.excludeEcctrlRay ?? false;
          return !excludeEcctrlRay;
        }
      );

      if (rayHit && rayHit.timeOfImpact < floatingDis + rayHitForgiveness) {
        if (slopeRayHit && (actualSlopeAngle ?? 0) < slopeMaxAngle) {
          canJump = true;
        }
      } else {
        canJump = false;
      }

      /**
       * Ray detect if on rigid body or dynamic platform, then apply the linear velocity and angular velocity to character
       */
      if (rayHit && canJump) {
        if (rayHit.collider.parent()) {
          // Getting the standing force apply point
          standingForcePoint.set(
            rayOrigin.x,
            rayOrigin.y - rayHit.timeOfImpact,
            rayOrigin.z
          );
          const rayHitObjectBodyType = rayHit.collider.parent()?.bodyType();
          const rayHitObjectBodyMass = rayHit.collider.parent()?.mass();
          massRatio =
            (characterRef.current?.mass() ?? 1) / (rayHitObjectBodyMass ?? 1);
          // Body type 0 is rigid body, body type 1 is fixed body, body type 2 is kinematic body
          if (rayHitObjectBodyType === 0 || rayHitObjectBodyType === 2) {
            isOnMovingObject = true;
            // Calculate distance between character and moving object
            distanceFromCharacterToObject
              .copy(currentPos)
              .sub(rayHit.collider.parent()?.translation() as THREE.Vector3);
            // Moving object linear velocity
            const movingObjectLinvel = rayHit.collider
              .parent()
              ?.linvel() as THREE.Vector3;
            // Moving object angular velocity
            const movingObjectAngvel = rayHit.collider
              .parent()
              ?.angvel() as THREE.Vector3;
            // Combine object linear velocity and angular velocity to movingObjectVelocity
            movingObjectVelocity
              .set(
                movingObjectLinvel.x +
                  objectAngvelToLinvel.crossVectors(
                    movingObjectAngvel,
                    distanceFromCharacterToObject
                  ).x,
                movingObjectLinvel.y,
                movingObjectLinvel.z +
                  objectAngvelToLinvel.crossVectors(
                    movingObjectAngvel,
                    distanceFromCharacterToObject
                  ).z
              )
              .multiplyScalar(Math.min(1, 1 / massRatio));
            // If the velocity diff is too high (> 30), ignore movingObjectVelocity
            velocityDiff.subVectors(movingObjectVelocity, currentVel);
            if (velocityDiff.length() > 30)
              movingObjectVelocity.multiplyScalar(1 / velocityDiff.length());

            // Apply opposite drage force to the stading rigid body, body type 0
            // Character moving and unmoving should provide different drag force to the platform
            if (rayHitObjectBodyType === 0) {
              if (
                // biome-ignore lint/complexity/useSimplifiedLogicExpression: <explanation>
                !forward &&
                !backward &&
                !leftward &&
                !rightward &&
                canJump &&
                joystickDis === 0 &&
                !isPointMoving &&
                !gamepadKeys.forward &&
                !gamepadKeys.backward &&
                !gamepadKeys.leftward &&
                !gamepadKeys.rightward
              ) {
                movingObjectDragForce
                  .copy(bodyContactForce)
                  .multiplyScalar(delta)
                  .multiplyScalar(Math.min(1, 1 / massRatio)) // Scale up/down base on different masses ratio
                  .negate();
                bodyContactForce.set(0, 0, 0);
              } else {
                movingObjectDragForce
                  .copy(moveImpulse)
                  .multiplyScalar(Math.min(1, 1 / massRatio)) // Scale up/down base on different masses ratio
                  .negate();
              }
              rayHit.collider
                .parent()
                ?.applyImpulseAtPoint(
                  movingObjectDragForce,
                  standingForcePoint,
                  true
                );
            }
          } else {
            // on fixed body
            massRatio = 1;
            isOnMovingObject = false;
            bodyContactForce.set(0, 0, 0);
            movingObjectVelocity.set(0, 0, 0);
          }
        }
      } else {
        // in the air
        massRatio = 1;
        isOnMovingObject = false;
        bodyContactForce.set(0, 0, 0);
        movingObjectVelocity.set(0, 0, 0);
      }

      /**
       * Slope ray casting detect if on slope
       */
      slopeRayOriginRef.current.getWorldPosition(slopeRayorigin);
      slopeRayorigin.y = rayOrigin.y;
      slopeRayHit = world.castRay(
        slopeRayCast,
        slopeRayLength,
        false,
        QueryFilterFlags.EXCLUDE_SENSORS,
        undefined,
        undefined,
        characterRef.current ?? undefined,
        // this exclude any collider with userData: excludeEcctrlRay
        (collider: Collider) => {
          const userData = collider.parent()?.userData as UserDataType;
          const excludeEcctrlRay = userData?.excludeEcctrlRay ?? false;
          return !excludeEcctrlRay;
        }
      );

      // Calculate slope angle
      if (slopeRayHit) {
        actualSlopeNormal =
          slopeRayHit.collider.castRayAndGetNormal(
            slopeRayCast,
            slopeRayLength,
            false
          )?.normal ?? null;
        if (actualSlopeNormal) {
          actualSlopeNormalVec?.set(
            actualSlopeNormal.x,
            actualSlopeNormal.y,
            actualSlopeNormal.z
          );
          actualSlopeAngle = actualSlopeNormalVec?.angleTo(floorNormal);
        }
      }
      if (
        slopeRayHit &&
        rayHit &&
        slopeRayHit.timeOfImpact < floatingDis + 0.5
      ) {
        if (canJump) {
          // Round the slope angle to 2 decimal places
          slopeAngle = Number(
            Math.atan(
              (rayHit.timeOfImpact - slopeRayHit.timeOfImpact) /
                slopeRayOriginOffest
            ).toFixed(2)
          );
        } else {
          slopeAngle = null;
        }
      } else {
        slopeAngle = null;
      }

      /**
       * Apply floating force
       */
      if (rayHit != null) {
        // biome-ignore lint/nursery/useCollapsedIf: <explanation>
        if (canJump && rayHit.collider.parent()) {
          floatingForce =
            springK * (floatingDis - rayHit.timeOfImpact) -
            (characterRef.current?.linvel().y ?? 0) * dampingC;
          characterRef.current?.applyImpulse(
            springDirVec.set(0, floatingForce, 0),
            false
          );

          // Apply opposite force to standing object (gravity g in rapier is 0.11 ?_?)
          characterMassForce.set(0, floatingForce > 0 ? -floatingForce : 0, 0);
          rayHit.collider
            .parent()
            ?.applyImpulseAtPoint(characterMassForce, standingForcePoint, true);
        }
      }

      /**
       * Apply drag force if it's not moving
       */
      if (
        // biome-ignore lint/complexity/useSimplifiedLogicExpression: safe
        !forward &&
        !backward &&
        !leftward &&
        !rightward &&
        canJump &&
        joystickDis === 0 &&
        !isPointMoving &&
        !gamepadKeys.forward &&
        !gamepadKeys.backward &&
        !gamepadKeys.leftward &&
        !gamepadKeys.rightward
      ) {
        // not on a moving object
        if (isOnMovingObject) {
          dragForce.set(
            (movingObjectVelocity.x - currentVel.x) * dragDampingC,
            0,
            (movingObjectVelocity.z - currentVel.z) * dragDampingC
          );
          characterRef.current?.applyImpulse(dragForce, true);
        } else {
          dragForce.set(
            -currentVel.x * dragDampingC,
            0,
            -currentVel.z * dragDampingC
          );
          characterRef.current?.applyImpulse(dragForce, false);
        }
      }

      /**
       * Detect character falling state
       */
      isFalling = !!(currentVel.y < 0 && !canJump);

      /**
       * Setup max falling speed && extra falling gravity
       * Remove gravity if falling speed higher than fallingMaxVel (negetive number so use "<")
       */
      if (characterRef.current) {
        if (currentVel.y < fallingMaxVel) {
          if (characterRef.current.gravityScale() !== 0) {
            characterRef.current.setGravityScale(0, true);
          }
        } else {
          // biome-ignore lint/style/useCollapsedElseIf: safe
          if (
            !isFalling &&
            characterRef.current.gravityScale() !== initialGravityScale
          ) {
            // Apply initial gravity after landed
            characterRef.current.setGravityScale(initialGravityScale, true);
          } else if (
            isFalling &&
            characterRef.current.gravityScale() !== fallingGravityScale
          ) {
            // Apply larger gravity when falling (if initialGravityScale === fallingGravityScale, won't trigger this)
            characterRef.current.setGravityScale(fallingGravityScale, true);
          }
        }
      }

      /**
       * Apply auto balance force to the character
       */
      if (autoBalance && characterRef.current) autoBalanceCharacter();

      /**
       * Point to move feature
       */
      if (isModePointToMove) {
        functionKeyDown =
          forward ||
          backward ||
          leftward ||
          rightward ||
          joystickDis > 0 ||
          gamepadKeys.forward ||
          gamepadKeys.backward ||
          gamepadKeys.leftward ||
          gamepadKeys.rightward ||
          jump ||
          button1Pressed;
        pointToMove(
          delta,
          slopeAngle ?? 0,
          movingObjectVelocity,
          functionKeyDown
        );
      }

      /**
       * Fixed camera feature
       */
      if (isModeFixedCamera) {
        if (
          leftward ||
          gamepadKeys.leftward ||
          (joystickDis > 0 &&
            joystickAng > (2 * Math.PI) / 3 &&
            joystickAng < (4 * Math.PI) / 3) ||
          (gamepadJoystickDis > 0 &&
            gamepadJoystickAng > (2 * Math.PI) / 3 &&
            gamepadJoystickAng < (4 * Math.PI) / 3)
        ) {
          pivot.rotation.y += run
            ? delta * sprintMult * fixedCamRotMult
            : delta * fixedCamRotMult;
        } else if (
          rightward ||
          gamepadKeys.rightward ||
          (joystickDis > 0 && joystickAng < Math.PI / 3) ||
          joystickAng > (5 * Math.PI) / 3 ||
          (gamepadJoystickDis > 0 && gamepadJoystickAng < Math.PI / 3) ||
          gamepadJoystickAng > (5 * Math.PI) / 3
        ) {
          pivot.rotation.y -= run
            ? delta * sprintMult * fixedCamRotMult
            : delta * fixedCamRotMult;
        }
      }

      /**
       * Apply all the animations
       */
      if (animated) {
        if (
          // biome-ignore lint/complexity/useSimplifiedLogicExpression: safe
          !forward &&
          !backward &&
          !leftward &&
          !rightward &&
          !jump &&
          !button1Pressed &&
          joystickDis === 0 &&
          !isPointMoving &&
          !gamepadKeys.forward &&
          !gamepadKeys.backward &&
          !gamepadKeys.leftward &&
          !gamepadKeys.rightward &&
          canJump
        ) {
          idleAnimation?.();
        } else if ((jump || button1Pressed) && canJump) {
          jumpAnimation?.();
        } else if (
          canJump &&
          (forward ||
            backward ||
            leftward ||
            rightward ||
            joystickDis > 0 ||
            isPointMoving ||
            gamepadKeys.forward ||
            gamepadKeys.backward ||
            gamepadKeys.leftward ||
            gamepadKeys.rightward)
        ) {
          run || runState ? runAnimation?.() : walkAnimation?.();
        } else if (!canJump) {
          jumpIdleAnimation?.();
        }
        // On high sky, play falling animation
        if (rayHit == null && isFalling) {
          fallAnimation?.();
        }
      }
    });

    return (
      <RigidBody
        colliders={false}
        ref={characterRef}
        position={props.position || [0, 5, 0]}
        friction={props.friction || -0.5}
        onContactForce={(e) =>
          bodyContactForce.set(e.totalForce.x, e.totalForce.y, e.totalForce.z)
        }
        onCollisionExit={() => bodyContactForce.set(0, 0, 0)}
        userData={{ canJump: false }}
        {...props}
      >
        <CapsuleCollider
          name='character-capsule-collider'
          args={[capsuleHalfHeight, capsuleRadius]}
        />
        {/* Body collide sensor (only for point to move mode) */}
        {isModePointToMove && (
          <CylinderCollider
            ref={bodySensorRef}
            sensor={true}
            mass={0}
            // biome-ignore lint/style/noNonNullAssertion: safe
            args={[bodySensorSize[0]!, bodySensorSize[1]!]}
            position={[
              bodySensorPosition.x,
              bodySensorPosition.y,
              bodySensorPosition.z,
            ]}
            onIntersectionEnter={handleOnIntersectionEnter}
            onIntersectionExit={handleOnIntersectionExit}
          />
        )}
        <group
          ref={characterModelRef}
          userData={{ camExcludeCollision: true }}
        >
          {/* This mesh is used for positioning the slope ray origin */}
          <mesh
            position={[
              rayOriginOffest.x,
              rayOriginOffest.y,
              rayOriginOffest.z + slopeRayOriginOffest,
            ]}
            ref={slopeRayOriginRef}
            visible={showSlopeRayOrigin}
            userData={{ camExcludeCollision: true }} // this won't be collide by camera ray
          >
            <boxGeometry args={[0.15, 0.15, 0.15]} />
          </mesh>
          {/* Character model */}
          {children}
        </group>
      </RigidBody>
    );
  }
);
