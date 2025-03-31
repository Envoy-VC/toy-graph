'use server';

import { env } from '~/env';
import type { ContributionResponse } from '~/types';
import { getYearBounds } from '.';

export const GET_CONTRIBUTIONS_QUERY = `query($username: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $username) {
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar {
        totalContributions
        weeks {
          firstDay
          contributionDays {
            contributionCount
            date
            contributionCount
            color
            weekday
          }
        }
      }
    }
  }
}`;

interface GetUserContributionsProps {
  username: string;
  year: number;
}

export const getUserContributions = async ({
  username,
  year,
}: GetUserContributionsProps) => {
  const { start, end } = getYearBounds(year);
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // biome-ignore lint/style/useNamingConvention: needed
      Authorization: `Bearer ${env.GITHUB_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      query: GET_CONTRIBUTIONS_QUERY,
      variables: {
        username,
        from: start,
        to: end,
      },
    }),
  });

  const data = (await res.json()) as ContributionResponse;

  if ('errors' in data) {
    throw new Error(data.errors.message);
  }

  return data.data.user.contributionsCollection.contributionCalendar;
};
