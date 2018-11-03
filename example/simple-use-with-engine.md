# Simple Engine Usage

Use ARTEngine to experience middle level of usage of Artix

下面这个例子是Engine最简单的使用
``` ts
  let canv = document.querySelector('canvas');
  let renderer = new GLRenderer(canv);
  const engine = new ARTEngine(renderer);
  const camera = new PerspectiveCamera();
  engine.setCamera(camera, new Matrix4());


  let testGeo = new TestGeometry();
  let testMat = new TestMaterial();

  let testMesh = new Mesh(testGeo, testMat);

  engine.renderObject(testMesh);

```