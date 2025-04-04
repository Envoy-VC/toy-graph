import { getISOWeek, parseISO } from 'date-fns';

import type {
  ContributionData,
  GroupedTrapeziumInstanceProps,
  RoundedTrapeziumInstanceProps,
} from '~/types';

export const getMonthNumber = (dateStringUTC: string) => {
  const date = parseISO(dateStringUTC);
  return {
    weekNumber: getISOWeek(date),
    monthNumber: date.getMonth() + 1,
  };
};

export const getYearBounds = (year: number) => {
  const start = new Date(Date.UTC(year, 0, 1, 0, 0, 0)).toISOString();
  const end = new Date(Date.UTC(year, 11, 31, 23, 59, 59)).toISOString();
  return { start, end };
};

export const getSideLengths = (
  absHeight: number,
  previousHeight: number,
  nextHeight: number
) => {
  const threshold = 3 / 10;

  const adjustHeight = (height: number, reference: number) => {
    const adjusted =
      Math.abs(height - reference) >= threshold &&
      reference !== 0 &&
      height !== 0
        ? Math.max(height, reference)
        : height;

    return adjusted + 0.2;
  };

  const side1 = adjustHeight(absHeight, previousHeight);
  const side2 = adjustHeight(absHeight, nextHeight);

  return {
    side1: Number(side1.toFixed(2)),
    side2: Number(side2.toFixed(2)),
  };
};

export const getInstancesData = (data: ContributionData) => {
  const res: RoundedTrapeziumInstanceProps[] = [];

  for (let weekIndex = 0; weekIndex < data.weeks.length; weekIndex++) {
    // biome-ignore lint/style/noNonNullAssertion: safe
    const week = data.weeks[weekIndex]!;
    for (
      let dayIndex = 0;
      dayIndex < week.contributionDays.length;
      dayIndex++
    ) {
      // biome-ignore lint/style/noNonNullAssertion: safe
      const day = week.contributionDays[dayIndex]!;
      const multiplier = 0.1;

      const { monthNumber } = getMonthNumber(day.date);
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

      const x = -66 + (weekIndex + monthNumber);
      const y = Number((Math.max(side1, side2) / 2).toFixed(2));
      const z = 3 - day.weekday;

      res.push({
        args: [1, side1, side2, 1],
        position: [x, y, z],
        color: day.color,
        date: day.date,
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
    const key = `${trap.args[1]}-${trap.args[2]}-${trap.color}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(trap);
  }
  return Object.entries(groups).map(([key, traps]) => ({
    key,
    instances: traps,
  }));
};
