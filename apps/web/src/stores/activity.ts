import { create } from 'zustand';
import type { ContributionData } from '~/types';

import activityDataDefault from 'public/data.json' assert { type: 'json' };

interface ActivityStore {
  data: ContributionData;
  setData: (data: ContributionData) => void;
}

export const useActivityStore = create<ActivityStore>((set) => ({
  data: activityDataDefault,
  setData: (data) => set({ data }),
}));
