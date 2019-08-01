import { Vector3 } from "../../math";


test('vector default value 0, 0, 0', () => {
  const v = new Vector3();
  expect(v.x).toBe(0); 
  expect(v.y).toBe(0); 
  expect(v.z).toBe(0); 
});

test('vector constructor', () => {
  const v = new Vector3(1, 3, 4);
  expect(v.x).toBe(1); 
  expect(v.y).toBe(3); 
  expect(v.z).toBe(4); 
});

test('vector set', () => {
  const v = new Vector3(1, 3, 4);
  v.set(5,6,7)
  expect(v.x).toBe(5); 
  expect(v.y).toBe(6); 
  expect(v.z).toBe(7); 
});

test('vector copy', () => {
  const v1 = new Vector3(1, 3, 4);
  const v2 = new Vector3(0, -1, -2);
  v1.copy(v2);
  expect(v1.x).toBe(0); 
  expect(v1.y).toBe(-1); 
  expect(v1.z).toBe(-2); 
});

test('vector equals', () => {
  const v1 = new Vector3(1, 3, 4);
  const v2 = new Vector3(1, 3, 4);
  expect(v1.equals(v2)).toBe(true);
});

test('vector add', () => {
  const v1 = new Vector3(1, 3, 4);
  const v2 = new Vector3(1, 2, 4);
  v1.add(v2);
  expect(v1.x).toBe(2); 
  expect(v1.y).toBe(5); 
  expect(v1.z).toBe(8); 
});

test('vector sub', () => {
  const v1 = new Vector3(1, 3, 4);
  const v2 = new Vector3(1, 2, 4);
  v1.sub(v2);
  expect(v1.x).toBe(0); 
  expect(v1.y).toBe(1); 
  expect(v1.z).toBe(0); 
});