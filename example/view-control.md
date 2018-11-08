# Camera interaction

```ts
  // choose a html elment as input source
  let canv = document.querySelector('canvas');
  const myInteractor = new Interactor(canv);
  const camera = new PerspectiveCamera();

  const myOrbitControler = new OrbitController(camera);
  myInteractor.registControler(myOrbitControler);

```