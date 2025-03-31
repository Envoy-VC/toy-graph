import { create } from 'zustand';
import type { ContributionData } from '~/types';

import activityDataDefault from 'public/data.json' assert { type: 'json' };

interface ActivityStore {
  isInitialData: boolean;
  data: ContributionData;
  setData: (data: ContributionData) => void;
  setIsInitialData: (isInitialData: boolean) => void;
}

export const useActivityStore = create<ActivityStore>((set) => ({
  isInitialData: true,
  data: activityDataDefault,
  setData: (data) => set({ data }),
  setIsInitialData: (isInitialData) => set({ isInitialData }),
}));
