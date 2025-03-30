import { Color } from 'three';

export const getColorFromHeight = (height: number) => {
  const lowColor = new Color('#B2D980'); // Very Low
  const midLowColor = new Color('#72C554'); // Low
  const midHighColor = new Color('#279C36'); // Medium
  const highColor = new Color('#136823'); // High

  if (height <= 1) return lowColor;
  if (height <= 2) return lowColor.lerp(midLowColor, (height - 1) / 1);
  if (height <= 3) return midLowColor.lerp(midHighColor, (height - 2) / 1);
  if (height <= 5) return midHighColor.lerp(highColor, (height - 3) / 2);
  return highColor; // Cap at highest color
};
