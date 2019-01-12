import ARTGL from '../../src/export';
import { ARTEngine, Mesh, PerspectiveCamera } from '../../src/artgl';

export class Application{
  engine: ARTEngine;
  el: HTMLCanvasElement;
  hasInitialized: boolean = false;
  active: boolean = true;
  initialize(canvas: HTMLCanvasElement) {
    this.el = canvas;
    this.engine = new ARTEngine(canvas);
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
    let testGeo = new ARTGL.SphereGeometry();
    let testMat = new ARTGL.NormalTechnique();
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        for (let k = 0; k < 5; k++) {
          const testMesh = new ARTGL.Mesh();
          testMesh.geometry = testGeo;
          testMesh.technique = testMat;
          testMesh.position.set(i, j, k);
          testMesh.scale.set(0.1, 0.1, 0.1);
          testMesh.updateLocalMatrix();
          testMesh.updateWorldMatrix(true);
          this.meshes.push(testMesh);
        }
      }
    }
  }

  render = () => {
    if (this.active) {
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