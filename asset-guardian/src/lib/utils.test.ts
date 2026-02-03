import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('combina classes condicionalmente', () => {
    expect(cn('a', false && 'b', 'c')).toBe('a c');
  });

  it('faz merge de classes Tailwind conflitantes', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
  });
});
