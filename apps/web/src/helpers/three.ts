import { Shape } from 'three';

export const eps = 0.00001;

export function createTrapeziumShape(
  width: number,
  side1: number,
  side2: number,
  radius0: number
) {
  const shape = new Shape();
  const radius = radius0 - eps;
  const dip = side1 === side2 ? 0 : 0.05;
  const insetY = radius * 2 + 3 * eps;
  const insetX = eps;

  const slope = (side2 - side1) / width;
  const angle = Math.PI / 2 + Math.atan(slope);

  shape.absarc(eps, eps, eps, -Math.PI / 2, -Math.PI, true);
  shape.absarc(eps, side1 - radius * 2, eps, Math.PI, angle, true);
  shape.absarc(width - radius * 2, side2 - radius * 2, eps, angle, 0, true);
  shape.absarc(width - radius * 2, eps, eps, 0, -Math.PI / 2, true);

  return shape;
}
