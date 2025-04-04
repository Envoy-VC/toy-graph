'use client';

import { EcctrlJoystick } from '@repo/ecctrl';

export const Joystick = () => {
  const isMobile = window.matchMedia('(pointer: coarse)').matches;
  if (isMobile) {
    return <EcctrlJoystick buttonNumber={1} />;
  }
  return null;
};
