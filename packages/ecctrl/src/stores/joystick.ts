import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

type JoyStickState = {
  curJoystickDis: number;
  curJoystickAng: number;
  curRunState: boolean;
  curButton1Pressed: boolean;
  curButton2Pressed: boolean;
  curButton3Pressed: boolean;
  curButton4Pressed: boolean;
  curButton5Pressed: boolean;
  setJoystick: (
    joystickDis: number,
    joystickAng: number,
    runState: boolean
  ) => void;
  resetJoystick: () => void;
  pressButton1: () => void;
  pressButton2: () => void;
  pressButton3: () => void;
  pressButton4: () => void;
  pressButton5: () => void;
  releaseAllButtons: () => void;
  getJoystickValues: () => {
    joystickDis: number;
    joystickAng: number;
    runState: boolean;
    button1Pressed: boolean;
    button2Pressed: boolean;
    button3Pressed: boolean;
    button4Pressed: boolean;
    button5Pressed: boolean;
  };
};

export const useJoystickControls = create(
  subscribeWithSelector<JoyStickState>((set, get) => {
    return {
      curJoystickDis: 0,
      curJoystickAng: 0,
      curRunState: false,
      curButton1Pressed: false,
      curButton2Pressed: false,
      curButton3Pressed: false,
      curButton4Pressed: false,
      curButton5Pressed: false,

      setJoystick: (
        joystickDis: number,
        joystickAng: number,
        runState: boolean
      ) => {
        set(() => {
          return {
            curJoystickDis: joystickDis,
            curJoystickAng: joystickAng,
            curRunState: runState,
          };
        });
      },

      resetJoystick: () => {
        set((state) => {
          if (state.curJoystickDis !== 0 || state.curJoystickAng !== 0) {
            return {
              curJoystickDis: 0,
              curJoystickAng: 0,
              curRunState: false,
            };
          }
          return {};
        });
      },

      pressButton1: () => {
        set((state) => {
          if (!state.curButton1Pressed) {
            return {
              curButton1Pressed: true,
            };
          }
          return {};
        });
      },

      pressButton2: () => {
        set((state) => {
          if (!state.curButton2Pressed) {
            return {
              curButton2Pressed: true,
            };
          }
          return {};
        });
      },

      pressButton3: () => {
        set((state) => {
          if (!state.curButton3Pressed) {
            return {
              curButton3Pressed: true,
            };
          }
          return {};
        });
      },

      pressButton4: () => {
        set((state) => {
          if (!state.curButton4Pressed) {
            return {
              curButton4Pressed: true,
            };
          }
          return {};
        });
      },

      pressButton5: () => {
        set((state) => {
          if (!state.curButton5Pressed) {
            return {
              curButton5Pressed: true,
            };
          }
          return {};
        });
      },

      releaseAllButtons: () => {
        set((state) => {
          if (state.curButton1Pressed) {
            return {
              curButton1Pressed: false,
            };
          }
          if (state.curButton2Pressed) {
            return {
              curButton2Pressed: false,
            };
          }
          if (state.curButton3Pressed) {
            return {
              curButton3Pressed: false,
            };
          }
          if (state.curButton4Pressed) {
            return {
              curButton4Pressed: false,
            };
          }
          if (state.curButton5Pressed) {
            return {
              curButton5Pressed: false,
            };
          }
          return {};
        });
      },

      getJoystickValues: () => {
        return {
          joystickDis: get().curJoystickDis,
          joystickAng: get().curJoystickAng,
          runState: get().curRunState,
          button1Pressed: get().curButton1Pressed,
          button2Pressed: get().curButton2Pressed,
          button3Pressed: get().curButton3Pressed,
          button4Pressed: get().curButton4Pressed,
          button5Pressed: get().curButton5Pressed,
        };
      },
    };
  })
);
