/**
 * Shared math + easing helpers.
 * Replaces the copies that lived inside HeroAtom, HomeScrollExperience,
 * GalleryOrbit, useMorphCoordinates and HeroToClubAnimation.
 */

export const TAU = Math.PI * 2;

export const degToRad = (deg: number) => (deg * Math.PI) / 180;

export function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function smoothstep(edge0: number, edge1: number, value: number) {
  const t = clamp((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/** Signed shortest rotation (radians) that takes `start` to `end`. */
export function shortestAngle(start: number, end: number) {
  let diff = (end - start) % TAU;
  if (diff > Math.PI) diff -= TAU;
  if (diff < -Math.PI) diff += TAU;
  return diff;
}

export function easeOutExpo(t: number) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function easeOutQuart(t: number) {
  return 1 - Math.pow(1 - t, 4);
}

export function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function easeInOutQuart(t: number) {
  return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
}