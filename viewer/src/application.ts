import ARTGL from '../../src/export';
import { ARTEngine, Mesh, PerspectiveCamera, Interactor, OrbitController } from '../../src/artgl';

export class Application{
  engine: ARTEngine;
  el: HTMLCanvasElement;
  hasInitialized: boolean = false;
  active: boolean = true;
  interactor: Interactor;
  orbitControler: OrbitController;
  initialize(canvas: HTMLCanvasElement) {
    this.el = canvas;
    this.engine = new ARTEngine(canvas);
    this.engine.camera.position.set(20, 10, 10)
    this.interactor = new Interactor(canvas);
    this.orbitControler = new OrbitController(this.engine.camera as PerspectiveCamera);
    this.orbitControler.registerInteractor(this.interactor);
    this.hasInitialized = true;
    this.createDemoScene();
    window.requestAnimationFrame(this.render);
    window.addEventListener('resize', this.onContainerResize);
    this.onContainerResize();
  }

  unintialize() {
    window.removeEventListener('resize', this.onContainerResize);
  }

  private onContainerResize = () => {
    const width = this.el.offsetWidth;
    const height = this.el.offsetHeight;
    this.engine.renderer.setSize(width, height);
    (this.engine.camera as PerspectiveCamera).aspect = width / height;
  }
  notifyResize() {
    this.onContainerResize();
  }

  meshes: Mesh[] = [];

  createDemoScene() {
    let testGeo = new ARTGL.SphereGeometry(1,40,40);
    let testMat = new ARTGL.NormalTechnique();
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        for (let k = 0; k < 5; k++) {
          const testMesh = new ARTGL.Mesh();
          testMesh.geometry = testGeo;
          testMesh.technique = testMat;
          testMesh.position.set(i, j, k);
          testMesh.scale.set(0.3, 0.3, 0.3);
          testMesh.updateLocalMatrix();
          testMesh.updateWorldMatrix(true);
          this.meshes.push(testMesh);
        }
      }
    }
  }

  render = () => {
    if (this.active) {
      this.orbitControler.update();
      this.engine.connectCamera();
      this.meshes.forEach(mesh => {
        this.engine.renderObject(mesh);
      })
    }
    window.requestAnimationFrame(this.render);
  }

  run() {
    this.active = true;
  }

  stop() {
    this.active = false;
  }

}

export let GLApp: Application = new Application();