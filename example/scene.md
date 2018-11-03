# 使用场景树

ARTEngine被设计支持多种上层结构的场景描述，上层结构通过适配器对接Engine。
artix提供一套场景图和相应的适配器实现。

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