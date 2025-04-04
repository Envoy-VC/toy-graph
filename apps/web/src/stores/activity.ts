import type { RapierCollider } from '@react-three/rapier';
import type { EcctrlRigidBodyRef } from '@repo/ecctrl';
import activityDataDefault from 'public/data.json' assert { type: 'json' };
import { create } from 'zustand';
import type { ContributionData } from '~/types';

interface ActivityStore {
  isInitialData: boolean;
  isPhysicsEnabled: boolean;
  data: ContributionData;
  characterRef: React.RefObject<EcctrlRigidBodyRef> | null;
  characterColliderRef: React.RefObject<RapierCollider> | null;
  setCharacterRef: (characterRef: React.RefObject<EcctrlRigidBodyRef>) => void;
  setCharacterColliderRef: (
    characterCollider: React.RefObject<RapierCollider>
  ) => void;
  setData: (data: ContributionData) => void;
  setIsInitialData: (isInitialData: boolean) => void;
  setIsPhysicsEnabled: (isPhysicsEnabled: boolean) => void;
}

export const useActivityStore = create<ActivityStore>((set, get) => ({
  isInitialData: true,
  data: activityDataDefault,
  isPhysicsEnabled: true,
  characterRef: null,
  characterColliderRef: null,
  setCharacterRef: (characterRef) => set({ characterRef }),
  setCharacterColliderRef: (characterCollider) =>
    set({ characterColliderRef: characterCollider }),
  setData: (data) => set({ data }),
  setIsInitialData: (isInitialData) => set({ isInitialData }),
  setIsPhysicsEnabled: (isPhysicsEnabled) => set({ isPhysicsEnabled }),
}));
