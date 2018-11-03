# 相机交互

```ts
  // 选择一个元素作为交互事件的触发器，一般是画布
  let canv = document.querySelector('canvas');
  const myInteractor = new Interactor(canv);
  const camera = new PerspectiveCamera();

  const myOrbitControler = new OrbitController(camera);
  myInteractor.registControler(myOrbitControler);

```