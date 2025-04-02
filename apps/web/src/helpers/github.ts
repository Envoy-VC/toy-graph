'use server';

import { type ResultAsync, err, ok } from 'neverthrow';
import { env } from '~/env';
import type { ContributionData, ContributionResponse } from '~/types';

import { getYearBounds } from '.';

const GET_CONTRIBUTIONS_QUERY = `query($username: String!, $from: DateTime!, $to: DateTime!) {
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

const GET_CONTRIBUTIONS_FOR_DAY_QUERY = `query ($username: String!, $date: DateTime!) {
  user(login: $username) {
    contributionsCollection(from: $date, to: $date) {
      commitContributionsByRepository {
        repository {
          name
        }
        contributions(first: 100) {
          nodes {
            occurredAt
            commitCount
          }
        }
      }
      pullRequestContributions(first: 100) {
        nodes {
          occurredAt
          pullRequest {
            title
            url
            repository {
              name
            }
          }
        }
      }
      issueContributions(first: 100) {
        nodes {
          occurredAt
          issue {
            title
            url
            repository {
              name
            }
          }
        }
      }
      pullRequestReviewContributions(first: 100) {
        nodes {
          occurredAt
          pullRequestReview {
            pullRequest {
              title
              url
              repository {
                name
              }
            }
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
}: GetUserContributionsProps): Promise<
  ResultAsync<ContributionData, string>
> => {
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
    return err(data.errors[0]?.message ?? 'Unknown error');
  }

  const result: ContributionData = {
    username,
    year,
    ...data.data.user.contributionsCollection.contributionCalendar,
  };

  return ok(result);
};
