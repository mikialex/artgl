import { BufferData } from "../buffer-data";


test('buffer data get set', () => {
  const data = new BufferData(new Float32Array([1, 2, 3, 4, 5, 6]), 3);

  expect(data.getIndex(0, 0)).toBe(1);
  expect(data.getIndex(0, 1)).toBe(2);
  expect(data.getIndex(0, 2)).toBe(3);
  expect(data.getIndex(1, 0)).toBe(4);
  expect(data.getIndex(1, 1)).toBe(5);
  expect(data.getIndex(1, 2)).toBe(6);
});
