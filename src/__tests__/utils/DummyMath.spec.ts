import { describe, expect, it } from 'vitest';

describe('DummyMath — intentional CI failure', () => {
  it('intentionally fails to demonstrate that CI blocks a broken unit test', () => {
    expect(2 + 2).toBe(5);
  });
});
