import ARTGL from '../export';

export default function() {
  let canv = document.querySelector('canvas') as HTMLCanvasElement; 
  const width = canv.clientWidth;
  const height = canv.clientHeight;
  const engine = new ARTGL.ARTEngine(canv);
  const camera = new ARTGL.PerspectiveCamera();

  camera.aspect = width / height;
  camera.position.set(0, 0, 10);
  camera.updateLocalMatrix();
  camera.updateWorldMatrix(true);
  engine.updateViewProjection(camera);


  let testGeo = new ARTGL.TestGeometry();
  let testMat = new ARTGL.TestTechnique();

  const meshes: ARTGL.Mesh[] = [];
  for (let i = 0; i < 20; i++) {
    for (let j = 0; j < 20; j++) {
      for (let k = 0; k < 20; k++) {
      // let testGeo2 = new TestGeometry();
      // const testMesh = new Mesh(testGeo2, testMat);

      const testMesh = new ARTGL.Mesh();
      testMesh.geometry = testGeo;
      testMesh.technique = testMat;
      testMesh.position.set(i, j, k);
      testMesh.scale.set(0.1, 0.1, 0.1);
      testMesh.updateLocalMatrix();
      testMesh.updateWorldMatrix(true);
      meshes.push(testMesh);
      }
    }
  }


  const myInteractor = new ARTGL.Interactor(canv);
  const myOrbitControler = new ARTGL.OrbitController(camera);
  myOrbitControler.registerInteractor(myInteractor);

  let active = false;
  document.body.addEventListener('mouseenter', () => {
    active = true;
  })
  document.body.addEventListener('mouseleave', () => {
    active = false;
  })

  function render() {
    myOrbitControler.update();
    camera.updateWorldMatrix(true);
    engine.updateViewProjection(camera);
    meshes.forEach(mesh => {
      engine.renderObject(mesh);
    })
    // engine.renderObject(testSpere);
  }

  window.requestAnimationFrame(tick);
  let time = 0;
  render();
  function tick() {
    time++;
    if (active) {
      render();
    }
    window.requestAnimationFrame(tick);
  }
}