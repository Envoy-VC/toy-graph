import type { AnimationSet } from '@repo/ecctrl';

export interface ContributionData {
  year: number;
  username: string;
  totalContributions: number;
  weeks: Week[];
}

export interface Week {
  firstDay: string;
  contributionDays: ContributionDay[];
}

export interface ContributionDay {
  contributionCount: number;
  date: string;
  color: string;
  weekday: number;
}

export interface RoundedTrapeziumInstanceProps {
  args: [number, number, number, number];
  position: [number, number, number];
  color: string;
  date: string;
}

export type GroupedTrapeziumInstanceProps = {
  key: string;
  instances: RoundedTrapeziumInstanceProps[];
};

export type SuccessContributionResponse = {
  data: {
    user: {
      contributionsCollection: {
        contributionCalendar: Omit<ContributionData, 'username' | 'year'>;
      };
    };
  };
};

export type ErrorContributionResponse = {
  data: {
    user: null;
  };
  errors: {
    type: string;
    path: string[];
    locations: {
      line: number;
      column: number;
    }[];
    message: string;
  }[];
};

export type ContributionResponse =
  | SuccessContributionResponse
  | ErrorContributionResponse;

const animations = [
  'Death_A',
  'FightM_Combo_A',
  'FightM_Death_A',
  'FightM_Hit_A',
  'FightM_Hit_B',
  'FightM_Hit_C',
  'FightM_Idle',
  'FightM_Pose',
  'FightM_Punch_A',
  'FightM_Punch_B',
  'FightM_Punch_C',
  'Idle_A',
  'Idle_A_Pose',
  'Idle_B',
  'Jump_A_InAir',
  'Jump_A_Start',
  'Jump_A_Landing',
  'Jump_B_Full',
  'Jump_B_InAir',
  'Jump_B_Landing',
  'Jump_B_Start',
  'Jump_C_Full',
  'Jump_C_InAir',
  'Jump_C_Start',
  'Jump_C_Landing',
  'LookingAround',
  'Pistol_Hit_A',
  'Pistol_Idle',
  'Pistol_Shoot',
  'Pistol_Walk',
  'Runing_A',
  'Runing_B',
  'Walk_A',
  'Walk_B',
  'Walk_C',
  'Zombie_Atack_A',
  'Zombie_Atack_B',
  'Zombie_Atack_C',
  'Zombie_Death_A',
  'Zombie_Death_B',
  'Zombie_Hit_A',
  'Zombie_Hit_B',
  'Zombie_Idle_A',
  'Zombie_Idle_B',
  'Zombie_Scream',
  'Zombie_Walk_A',
  'Zombie_Walk_B',
] as const;

export type AnimationType = (typeof animations)[number];

export const animationSet: AnimationSet = {
  idle: 'Idle_A',
  walk: 'Walk_A',
  run: 'Runing_A',
  jump: 'Jump_A_Start',
  jumpIdle: 'Jump_A_InAir',
  jumpLand: 'Jump_A_Landing',
  fall: 'Climbing',
  action1: 'FightM_Combo_A',
  action2: 'LookingAround',
};
