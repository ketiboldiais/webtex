import { word, a, an } from '../../src/PCox';
import { output } from '../../src/PCox/util';
import { it, expect } from 'vitest';

it('should succeed on non-empty args', () => {
  const input = 'abc';
  const out = output(['a', 'b', 'c'])
    .with('erm', '')
    .with('err', false)
    .with('index', 3)
    .with('input', input)
    .with('type', 'word::char')
    .build();
  const result = word(an('a'), a('b'), a('c')).run(input);
  expect(result).toEqual(out);
});

it('should err on no args', () => {
  const result = word().run('abc');
  expect(result.err).toBe(true);
});
