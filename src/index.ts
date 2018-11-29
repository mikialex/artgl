import cube8k from './usecase/cube-8k';
import objload from './usecase/load-obj';

window.onload = async function () {
  objload();
  // setTimeout(() => {
  //   openFile()
  // }, 1000);
  // cube8k();
  // const test = new Vector3Observable(1, 2, 3);
  // test.onChange = () => { console.log('test1 change') };
  // (window as any).test = test;
  // test.x = 3;
  // console.log(test);

  // const test2 = new Vector3Observable(1, 2, 3);
  // test2.onChange = () => { console.log('test2 change') };
  // (window as any).test2 = test2;
  // test2.x = 3;
}
