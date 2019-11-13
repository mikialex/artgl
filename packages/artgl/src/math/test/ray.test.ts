import { Ray } from "../entity/ray";
import { Vector3 } from "../../math";

test('ray default value', () => {
  const v = new Ray();
  expect(v.origin.x).toBe(0); 
  expect(v.origin.y).toBe(0); 
  expect(v.origin.z).toBe(0); 
  expect(v.direction.x).toBe(0); 
  expect(v.direction.y).toBe(0); 
  expect(v.direction.z).toBe(1); 
});

test('ray copy', () => {
  const v = new Ray();
  v.origin.x = 10;
  const v2 = new Ray();
  v2.copy(v);
  expect(v.origin.x).toBe(10); 
  expect(v2.origin.x).toBe(10); 
});

test('ray clone', () => {
  const v = new Ray();
  v.origin.x = 10;
  const v2 = v.clone();
  expect(v.origin.x).toBe(10); 
  expect(v2.origin.x).toBe(10); 
  v.origin.x = 100;
  expect(v.origin.x).toBe(100); 
  expect(v2.origin.x).toBe(10); 
});

test('ray look at', () => {
  const v = new Ray();
  v.lookAt(new Vector3(10, 0, 0));
  expect(v.origin.x).toBe(0); 
  expect(v.origin.y).toBe(0); 
  expect(v.origin.z).toBe(0); 
  expect(v.direction.x).toBe(1); 
  expect(v.direction.y).toBe(0); 
  expect(v.direction.z).toBe(0); 
});