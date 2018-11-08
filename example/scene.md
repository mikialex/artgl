# Scene Description

ARTEngine is designed to suppport different scene decription system. The upper structure use an adpator to supply renderdata to engine; We provide a standard scene tree implementation for you.

```ts
  let canv = document.querySelector('canvas');
  let renderer = new GLRenderer(canv);

  const engine = new ARTEngine(renderer);

  const scene = new Scene();
  const adaptor = new ARTEngineAdaptor();
  engine.useAdptor(adaptor);
  adaptor.adpat(scene);

  const camera = new PerspectiveCamera();
  scene.setCamera(camera);

  const root = new SceneNode();
  scene.setRootNode(root);

  let testGeo = new TestGeometry();
  let testMat = new TestMaterial();
  let testMesh = new Mesh(testGeo, testMat);

  root.add(testMesh)；

  scene.render();
```