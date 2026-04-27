import {describe, expect, it} from 'vitest';
import {getNormalBlurAmount} from './blur-pass';

describe('normal blur strength mapping', () => {
  it('ramps gently and stays capped at the strongest setting', () => {
    expect(getNormalBlurAmount(1)).toBeCloseTo(0.85, 2);
    expect(getNormalBlurAmount(7)).toBeLessThan(3);
    expect(getNormalBlurAmount(30)).toBeCloseTo(14, 2);
    expect(getNormalBlurAmount(100)).toBeCloseTo(getNormalBlurAmount(30), 5);
  });

  it('increases monotonically across the slider range', () => {
    let previous = getNormalBlurAmount(1);

    for (let strength = 2; strength <= 30; strength += 1) {
      const next = getNormalBlurAmount(strength);
      expect(next).toBeGreaterThan(previous);
      previous = next;
    }
  });
});
