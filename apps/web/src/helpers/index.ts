import { endOfYear, getISOWeek, parseISO, startOfYear } from 'date-fns';

import type {
  ContributionData,
  GroupedTrapeziumInstanceProps,
  RoundedTrapeziumInstanceProps,
} from '~/types';

export const getWeekAndMonthNumber = (dateString: string) => {
  const date = parseISO(dateString);
  return {
    weekNumber: getISOWeek(date),
    monthNumber: date.getUTCMonth() + 1,
  };
};

export const getYearBounds = (year: number) => {
  const start = startOfYear(new Date(year, 0, 1)).toISOString();
  const end = endOfYear(new Date(year, 11, 31)).toISOString();
  return {
    start,
    end,
  };
};

export const getSideLengths = (
  absHeight: number,
  previousHeight: number,
  nextHeight: number
) => {
  const threshold = 3 / 10;

  const adjustHeight = (height: number, reference: number) =>
    Math.abs(height - reference) >= threshold && reference !== 0
      ? Math.max(height, reference)
      : height;

  const side1 = adjustHeight(absHeight, previousHeight) + 0.2;
  const side2 = adjustHeight(absHeight, nextHeight) + 0.2;

  return {
    side1,
    side2,
  };
};

export const getInstancesData = (data: ContributionData) => {
  const res: RoundedTrapeziumInstanceProps[] = [];

  for (const week of data.weeks) {
    for (
      let dayIndex = 0;
      dayIndex < week.contributionDays.length;
      dayIndex++
    ) {
      // biome-ignore lint/style/noNonNullAssertion: safe
      const day = week.contributionDays[dayIndex]!;
      const multiplier = 0.1;
      const z = 4 - Number((7 - day.weekday).toFixed(2));
      const { weekNumber, monthNumber } = getWeekAndMonthNumber(day.date);
      const absHeight = day.contributionCount * multiplier;
      const previousDayHeight =
        (week.contributionDays[dayIndex - 1]?.contributionCount ?? 0) *
        multiplier;
      const nextDayHeight =
        (week.contributionDays[dayIndex + 1]?.contributionCount ?? 0) *
        multiplier;

      const { side1, side2 } = getSideLengths(
        absHeight,
        previousDayHeight,
        nextDayHeight
      );

      const x = -(weekNumber + monthNumber);
      const y = Math.max(side1, side2) / 2;

      res.push({
        args: [1, side1, side2, 1],
        position: [x, y, z],
        color: day.color,
      });
    }
  }

  return res;
};

export const groupTrapProps = (
  traps: RoundedTrapeziumInstanceProps[]
): GroupedTrapeziumInstanceProps[] => {
  const groups: Record<string, RoundedTrapeziumInstanceProps[]> = {};
  for (const trap of traps) {
    const key = `${trap.args[1]}-${trap.args[2]}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(trap);
  }
  return Object.entries(groups).map(([key, traps]) => ({
    key,
    instances: traps,
  }));
};
