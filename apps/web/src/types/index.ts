export interface ContributionData {
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
}

export type GroupedTrapeziumInstanceProps = {
  key: string;
  instances: RoundedTrapeziumInstanceProps[];
};
