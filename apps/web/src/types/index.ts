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
