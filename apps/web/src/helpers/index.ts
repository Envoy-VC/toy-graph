import type {
  ContributionData,
  GroupedTrapeziumInstanceProps,
  RoundedTrapeziumInstanceProps,
} from '~/types';

export const getWeekNumber = (dateString: string) => {
  const date = new Date(dateString);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const diffInDays = Math.floor(
    (date.getTime() - yearStart.getTime()) / (24 * 60 * 60 * 1000)
  );

  return Math.ceil((diffInDays + yearStart.getUTCDay() + 1) / 7);
};

export const getMonthNumber = (dateString: string) => {
  const date = new Date(dateString);
  return date.getUTCMonth() + 1;
};

export const getSideLengths = (
  absHeight: number,
  previousHeight: number,
  nextHeight: number
): [number, number] => {
  let side1: number;
  let side2: number;

  const prevHightDiff = Math.abs(absHeight - previousHeight);
  const threshold = 3 / 10;

  if (prevHightDiff >= threshold && previousHeight !== 0) {
    side1 = Math.max(previousHeight, absHeight);
  } else {
    side1 = absHeight;
  }

  const nextHightDiff = Math.abs(nextHeight - absHeight);
  if (nextHightDiff >= threshold && nextHeight !== 0) {
    side2 = Math.max(nextHeight, absHeight);
  } else {
    side2 = absHeight;
  }

  side1 += 0.2;
  side2 += 0.2;

  return [Number(side1.toFixed(2)), Number(side2.toFixed(2))];
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
      const weekNumber = getWeekNumber(day.date);
      const offset = getMonthNumber(day.date);
      const x = -(weekNumber + offset);
      const absHeight = day.contributionCount * multiplier;
      const previousDayHeight =
        (week.contributionDays[dayIndex - 1]?.contributionCount ?? 0) *
        multiplier;
      const nextDayHeight =
        (week.contributionDays[dayIndex + 1]?.contributionCount ?? 0) *
        multiplier;

      const [side1, side2] = getSideLengths(
        absHeight,
        previousDayHeight,
        nextDayHeight
      );

      res.push({
        args: [1, side1, side2, 1],
        position: [x, Math.max(side1, side2) / 2, z],
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
