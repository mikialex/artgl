# Simple Engine Usage

Use ARTEngine to experience middle level of usage of Artix. Using inner render abstraction such as geometry and material.

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