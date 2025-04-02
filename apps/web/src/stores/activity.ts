import activityDataDefault from 'public/data.json' assert { type: 'json' };
import { create } from 'zustand';
import type { ContributionData } from '~/types';

interface ActivityStore {
  isInitialData: boolean;
  isPhysicsEnabled: boolean;
  data: ContributionData;
  setData: (data: ContributionData) => void;
  setIsInitialData: (isInitialData: boolean) => void;
  setIsPhysicsEnabled: (isPhysicsEnabled: boolean) => void;
}

export const useActivityStore = create<ActivityStore>((set, get) => ({
  isInitialData: true,
  data: activityDataDefault,
  isPhysicsEnabled: true,
  setData: (data) => set({ data }),
  setIsInitialData: (isInitialData) => set({ isInitialData }),
  setIsPhysicsEnabled: (isPhysicsEnabled) => set({ isPhysicsEnabled }),
}));
