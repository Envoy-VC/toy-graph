import { useThree } from '@react-three/fiber';
// import { useRapier } from "@react-three/rapier";
import { useEffect, useMemo, useRef } from 'react';
import * as three from 'three';

import type { UseFollowCameraProps } from '~/types';

export const useFollowCam = ({
  disableFollowCam = false,
  disableFollowCamPos = undefined,
  disableFollowCamTarget = undefined,
  camInitDis = -5,
  camMaxDis = -7,
  camMinDis = -0.7,
  camUpLimit = 1.5, // in rad
  camLowLimit = -1.3, // in rad
  camInitDir = { x: 0, y: 0 }, // in rad
  camMoveSpeed = 1,
  camZoomSpeed = 1,
  camCollisionOffset = 0.7, // percentage
  camCollisionSpeedMult = 4,
  camListenerTarget = 'domElement',
  ...props
}: UseFollowCameraProps = {}) => {
  const { scene, camera, gl } = useThree();

  let isMouseDown = false;
  let previousTouch1: Touch | null = null;
  let previousTouch2: Touch | null = null;

  const originZDis = useRef<number>(camInitDis ?? -5);
  const pivot = useMemo(() => new three.Object3D(), []);

  const followCam = useMemo(() => {
    const origin = new three.Object3D();
    origin.position.set(
      0,
      originZDis.current * Math.sin(-camInitDir.x),
      originZDis.current * Math.cos(-camInitDir.x)
    );
    return origin;
  }, [camInitDir.x]);

  /** Camera Collision detect setups */
  let smallestDistance = null;
  let cameraDistance = null;
  let intersects = null;

  const intersectObjects = useRef<three.Object3D[]>([]);
  const cameraRayDir = useMemo(() => new three.Vector3(), []);
  const cameraRayOrigin = useMemo(() => new three.Vector3(), []);
  const cameraPosition = useMemo(() => new three.Vector3(), []);
  const camLerpingPoint = useMemo(() => new three.Vector3(), []);
  const camRayCast = new three.Raycaster(
    cameraRayOrigin,
    cameraRayDir,
    0,
    -camMaxDis
  );

  // Mouse move event
  const onDocumentMouseMove = (e: MouseEvent) => {
    if (document.pointerLockElement || isMouseDown) {
      pivot.rotation.y -= e.movementX * 0.002 * camMoveSpeed;
      const vy = followCam.rotation.x + e.movementY * 0.002 * camMoveSpeed;

      cameraDistance = followCam.position.length();

      if (vy >= camLowLimit && vy <= camUpLimit) {
        followCam.rotation.x = vy;
        followCam.position.y = -cameraDistance * Math.sin(-vy);
        followCam.position.z = -cameraDistance * Math.cos(-vy);
      }
    }
    return false;
  };

  // Mouse scroll event
  const onDocumentMouseWheel = (e: Event) => {
    const vz =
      originZDis.current - (e as WheelEvent).deltaY * 0.002 * camZoomSpeed;
    const vy = followCam.rotation.x;

    if (vz >= camMaxDis && vz <= camMinDis) {
      originZDis.current = vz;
      followCam.position.z = originZDis.current * Math.cos(-vy);
      followCam.position.y = originZDis.current * Math.sin(-vy);
    }
    return false;
  };

  // Touch End event
  const onTouchEnd = (e: TouchEvent) => {
    previousTouch1 = null;
    previousTouch2 = null;
  };

  // Touch move event
  const onTouchMove = (e: TouchEvent) => {
    // prevent swipe to navigate gesture
    e.preventDefault();
    e.stopImmediatePropagation();

    const touch1 = e.targetTouches[0];
    const touch2 = e.targetTouches[1];

    // One finger touch to rotate camera
    if (previousTouch1 && !previousTouch2 && touch1) {
      const touch1MovementX = touch1.pageX - previousTouch1.pageX;
      const touch1MovementY = touch1.pageY - previousTouch1.pageY;

      pivot.rotation.y -= touch1MovementX * 0.005 * camMoveSpeed;
      const vy = followCam.rotation.x + touch1MovementY * 0.005 * camMoveSpeed;

      cameraDistance = followCam.position.length();

      if (vy >= camLowLimit && vy <= camUpLimit) {
        followCam.rotation.x = vy;
        followCam.position.y = -cameraDistance * Math.sin(-vy);
        followCam.position.z = -cameraDistance * Math.cos(-vy);
      }
    }

    // Two fingers touch to zoom in/out camera
    if (previousTouch2 && previousTouch1) {
      const prePinchDis = Math.hypot(
        previousTouch1.pageX - previousTouch2.pageX,
        previousTouch1.pageY - previousTouch2.pageY
      );

      const pinchX1 = e.touches[0]?.pageX ?? 0;
      const pinchY1 = e.touches[0]?.pageY ?? 0;
      const pinchX2 = e.touches[1]?.pageX ?? 0;
      const pinchY2 = e.touches[1]?.pageY ?? 0;
      const pinchDis = Math.hypot(pinchX1 - pinchX2, pinchY1 - pinchY2);

      const vz =
        originZDis.current - (prePinchDis - pinchDis) * 0.01 * camZoomSpeed;
      const vy = followCam.rotation.x;

      if (vz >= camMaxDis && vz <= camMinDis) {
        originZDis.current = vz;
        followCam.position.z = originZDis.current * Math.cos(-vy);
        followCam.position.y = originZDis.current * Math.sin(-vy);
      }
    }

    previousTouch1 = touch1 ?? null;
    previousTouch2 = touch2 ?? null;
  };

  /**
   * Gamepad second joystick event
   */
  const joystickCamMove = (movementX: number, movementY: number) => {
    pivot.rotation.y -= movementX * 0.005 * camMoveSpeed * 5;
    const vy = followCam.rotation.x + movementY * 0.005 * camMoveSpeed * 5;

    cameraDistance = followCam.position.length();

    if (vy >= camLowLimit && vy <= camUpLimit) {
      followCam.rotation.x = vy;
      followCam.position.y = -cameraDistance * Math.sin(-vy);
      followCam.position.z = -cameraDistance * Math.cos(vy);
    }
  };

  /**
   * Custom traverse function
   */
  function customTraverseAdd(object: three.Object3D) {
    if (object.userData && object.userData.camExcludeCollision === true) {
      return;
    }

    // Check if the object is a Mesh, and is visible
    if ((object as three.Mesh).isMesh && (object as three.Mesh).visible) {
      intersectObjects.current.push(object);
    }

    // Recursively traverse child objects
    for (const child of object.children) {
      customTraverseAdd(child); // Continue the traversal for all child objects
    }
  }
  // Remove intersect objects from camera collision array
  function customTraverseRemove(object: three.Object3D) {
    intersectObjects.current = intersectObjects.current.filter(
      (item) => item.uuid !== object.uuid // Keep all items except the one to remove
    );

    // Recursively traverse child objects
    for (const child of object.children) {
      customTraverseRemove(child); // Continue the traversal for all child objects
    }
  }

  /**
   * Camera collision detection function
   */
  const cameraCollisionDetect = (delta: number) => {
    // Update collision detect ray origin and pointing direction
    // Which is from pivot point to camera position
    cameraRayOrigin.copy(pivot.position);
    camera.getWorldPosition(cameraPosition);
    cameraRayDir.subVectors(cameraPosition, pivot.position);

    // casting ray hit, if object in between character and camera,
    // change the smallestDistance to the ray hit toi
    // otherwise the smallestDistance is same as camera original position (originZDis)
    intersects = camRayCast.intersectObjects(intersectObjects.current);
    const intersectDistance = intersects[0]?.distance ?? -originZDis.current;
    if (intersects.length > 0 && intersectDistance <= -originZDis.current) {
      smallestDistance = Math.min(
        -intersectDistance * camCollisionOffset,
        camMinDis
      );
    } else {
      smallestDistance = originZDis.current;
    }

    // Rapier ray hit setup (optional)
    // rayHit = world.castRay(rayCast, rayLength + 1, true, null, null, character);
    // if (rayHit && rayHit.toi && rayHit.toi > originZDis) {
    //   smallestDistance = -rayHit.toi + 0.5;
    // } else if (rayHit == null) {
    //   smallestDistance = originZDis;
    // }

    // Update camera next lerping position, and lerp the camera
    camLerpingPoint.set(
      followCam.position.x,
      smallestDistance * Math.sin(-followCam.rotation.x),
      smallestDistance * Math.cos(-followCam.rotation.x)
    );

    followCam.position.lerp(
      camLerpingPoint,
      1 - Math.exp(-camCollisionSpeedMult * delta)
    ); // delta * 2 for rapier ray setup
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: only run once
  useEffect(() => {
    // Initialize camera facing direction
    pivot.rotation.y = camInitDir.y;
    followCam.rotation.x = camInitDir.x;

    // Prepare for camera ray intersect objects
    for (const child of scene.children) {
      customTraverseAdd(child);
    }

    // Prepare for followCam and pivot point
    // disableFollowCam ? followCam.remove(camera) : followCam.add(camera);
    pivot.add(followCam);
    scene.add(pivot);

    if (camListenerTarget === 'domElement') {
      gl.domElement.addEventListener('mousedown', () => {
        isMouseDown = true;
      });
      gl.domElement.addEventListener('mouseup', () => {
        isMouseDown = false;
      });
      gl.domElement.addEventListener('mousemove', onDocumentMouseMove);
      gl.domElement.addEventListener('mousewheel', onDocumentMouseWheel);
      // Touch event
      gl.domElement.addEventListener('touchend', onTouchEnd);
      gl.domElement.addEventListener('touchmove', onTouchMove, {
        passive: false,
      });
    } else if (camListenerTarget === 'document') {
      document.addEventListener('mousedown', () => {
        isMouseDown = true;
      });
      document.addEventListener('mouseup', () => {
        isMouseDown = false;
      });
      document.addEventListener('mousemove', onDocumentMouseMove);
      document.addEventListener('mousewheel', onDocumentMouseWheel);
      // Touch event
      document.addEventListener('touchend', onTouchEnd);
      document.addEventListener('touchmove', onTouchMove, { passive: false });
    }

    return () => {
      if (camListenerTarget === 'domElement') {
        gl.domElement.removeEventListener('mousedown', () => {
          isMouseDown = true;
        });
        gl.domElement.removeEventListener('mouseup', () => {
          isMouseDown = false;
        });
        gl.domElement.removeEventListener('mousemove', onDocumentMouseMove);
        gl.domElement.removeEventListener('mousewheel', onDocumentMouseWheel);
        // Touch event
        gl.domElement.removeEventListener('touchend', onTouchEnd);
        gl.domElement.removeEventListener('touchmove', onTouchMove);
      } else if (camListenerTarget === 'document') {
        document.removeEventListener('mousedown', () => {
          isMouseDown = true;
        });
        document.removeEventListener('mouseup', () => {
          isMouseDown = false;
        });
        document.removeEventListener('mousemove', onDocumentMouseMove);
        document.removeEventListener('mousewheel', onDocumentMouseWheel);
        // Touch event
        document.removeEventListener('touchend', onTouchEnd);
        document.removeEventListener('touchmove', onTouchMove);
      }
    };
  }, []);

  // If followCam is disabled set to disableFollowCamPos, target to disableFollowCamTarget
  // biome-ignore lint/correctness/useExhaustiveDependencies: only run when disableFollowCam changes
  useEffect(() => {
    if (disableFollowCam) {
      if (disableFollowCamPos)
        camera.position.set(
          disableFollowCamPos.x,
          disableFollowCamPos.y,
          disableFollowCamPos.z
        );
      if (disableFollowCamTarget)
        camera.lookAt(
          new three.Vector3(
            disableFollowCamTarget.x,
            disableFollowCamTarget.y,
            disableFollowCamTarget.z
          )
        );
    }
  }, [disableFollowCam]);

  // Handle scene add/remove objects events
  // biome-ignore lint/correctness/useExhaustiveDependencies: only run  on scene change
  useEffect(() => {
    const onObjectAdded = (e: { child: three.Object3D }) =>
      customTraverseAdd(e.child);
    const onObjectRemoved = (e: { child: three.Object3D }) =>
      scene.addEventListener('childadded', onObjectAdded);
    scene.addEventListener('childremoved', onObjectRemoved);
    return () => {
      scene.removeEventListener('childadded', onObjectAdded);
      scene.removeEventListener('childremoved', onObjectRemoved);
    };
  }, [scene]);

  return { pivot, followCam, cameraCollisionDetect, joystickCamMove };
};
