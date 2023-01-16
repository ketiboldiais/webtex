import { output } from '../src/util';
import { one, strung } from '../src';
import { it, expect } from 'vitest';

it('should parse one character correctly', () => {
  const input = 'a';
  const out = output(input)
    .with('erm', '')
    .with('err', false)
    .with('index', 1)
    .with('input', input)
    .with('type', 'ascii-letters')
    .build();
  const result = strung('letters').run(input);
  expect(result).toEqual(out);
});


it('should give a non-empty error message for empty string', () => {
  const input = 'x';
  const result = strung('letters').run('');
  expect(result.erm).toBeTruthy();
});

