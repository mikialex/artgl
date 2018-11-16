import cube8k from './usecase/cube-8k';
import { Vector3Observable } from './math/vector3-observable';

window.onload = function () {

  // cube8k();
  const test = new Vector3Observable(1, 2, 3);
  test.onChange = () => { console.log('c') };
  (window as any).test = test;
  test.x = 3;

  const test2 = new Vector3Observable(1, 2, 3);
  test.onChange = () => { console.log('ddd') };
  (window as any).test2 = test;
  test.x = 3;
}
