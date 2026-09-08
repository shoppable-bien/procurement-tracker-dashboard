import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCsv, rowsToObjects } from '../src/source/csv.js';

test('CSV parser preserves quoted commas, quotes, and line breaks', () => {
  const rows = parseCsv('A,B\n"one, two","line one\nline two"\n"say ""hello""",done');
  assert.deepEqual(rows, [['A', 'B'], ['one, two', 'line one\nline two'], ['say "hello"', 'done']]);
});

test('CSV rows become header-keyed objects', () => {
  const result = rowsToObjects(parseCsv('Name,Name,Value\nA,B,2'));
  assert.equal(result.rows[0].Name, 'A');
  assert.equal(result.rows[0].Name__2, 'B');
  assert.equal(result.rows[0].Value, '2');
});
