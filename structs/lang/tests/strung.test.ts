import { output } from '../src/util';
import { strung } from '../src';
import { it, expect } from 'vitest';

it('should succeed on string of length 1', () => {
  const input = 'a';
  const out = output(input)
    .with('erm', '')
    .with('err', false)
    .with('index', 1)
    .with('input', input)
    .with('type', 'string::letters')
    .build();
  const result = strung('letters').run(input);
  expect(result).toEqual(out);
});

it('should succeed on multiletters', () => {
  const input = 'success';
  const out = output(input)
    .with('erm', '')
    .with('err', false)
    .with('index', 7)
    .with('input', input)
    .with('type', 'string::letters')
    .build();
  const result = strung('letters').run(input);
  expect(result).toEqual(out);
});


it('should set err is true for empty string', () => {
  const input = 'abcdefg';
  const result = strung('letters').run('');
  expect(result.err).toBe(true)
});