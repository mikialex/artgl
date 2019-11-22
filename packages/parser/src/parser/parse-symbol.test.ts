import { makeTerminal, makeNonTerminal, EOF } from "./parse-symbol";
import { ParseConfiguration } from './parse-configuration';

const a = makeTerminal('a')
const b = makeTerminal('b')
const X = makeNonTerminal('X')
const S = makeNonTerminal('S')

X.addRule([a, X])
  .addRule([b])

S.addRule([X, X])

test('first set', () => {
  const first = S.getFirstSet();
  expect(first.size).toBe(2);
  expect(first.has(a)).toBe(true);
  expect(first.has(b)).toBe(true);
});

test('closure', () => {
  const start = new ParseConfiguration(S.rules[0], 0, new Set([EOF]));
  const result = start.genClosureParseConfigurations();
  expect(result.length).toBe(3)
})