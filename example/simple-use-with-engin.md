# Simple Engine Usage

Use ARTEngine to experience middle level of usage of Artix

renderer仅仅提供了底层的gl封装，使用ARTEngine，可以开启Artix的中层使用方式。在Artix中，存在诸多例如Camera Geometry Material的抽象，ARTEngine是整合这些体系并调用底层renderer进行渲染的核心。

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

  engine.renderObject(testMesh, new Matrix4());

```