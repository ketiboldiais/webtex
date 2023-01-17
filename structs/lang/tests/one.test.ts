import { output } from '../src/util';
import { a,an } from '../src';
import { it, expect } from 'vitest';

it('should parse one character correctly', () => {
  const input = 'a';
  const out = output(input)
    .with('erm', '')
    .with('err', false)
    .with('index', 1)
    .with('input', input)
    .with('type', 'char')
    .build();
  const result = an(input).run(input);
  expect(result).toEqual(out);
});


it('should parse only one among multiple characters', () => {
  const input = 'abc';
  const out = output('a')
    .with('erm', '')
    .with('err', false)
    .with('index', 1)
    .with('input', input)
    .with('type', 'char')
    .build();
  const result = an('a').run(input);
  expect(result).toEqual(out);
});

it('should give a non-empty error message for empty string', () => {
  const input = 'x';
  const result = an(input).run('');
  expect(result.erm).toBeTruthy();
});

it('should return a non-empty error message for wrong char', () => {
  const input = 'x';
  const result = an(input).run('y');
  expect(result.erm).toBeTruthy();
});

it('should set err is true for wrong char', () => {
  const input = 'x';
  const result = an(input).run('y');
  expect(result.err).toBe(true)
});

it('should set err is true for empty string', () => {
  const input = 'x';
  const result = an(input).run('');
  expect(result.err).toBe(true)
});