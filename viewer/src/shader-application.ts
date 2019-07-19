
import {
  RenderEngine, Technique, Mesh, Interactor, OrbitController,
  ShaderGraph,PerspectiveCamera, Scene, NormalShading, SphereGeometry
} from '../../src/artgl';

import { Shading } from '../../src/core/technique';

export class ShaderApplication {

  canvas: HTMLCanvasElement;
  graph: ShaderGraph = new ShaderGraph();
  scene: Scene = new Scene();

  shader: Shading;
  mesh: Mesh;
  interactor: Interactor;
  orbitController: OrbitController;

  engine: RenderEngine;


  init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.engine = new RenderEngine(canvas);
    this.engine.camera.transform.position.set(20, 10, 10)
    this.interactor = new Interactor(canvas);
    this.orbitController = new OrbitController(this.engine.camera as PerspectiveCamera);
    this.orbitController.registerInteractor(this.interactor);
    this.shader = new NormalShading();
    this.loadScene();
    this.tick();
    this.start();

    window.addEventListener('resize', this.onContainerResize);
    this.onContainerResize();
  }

  updateShader() {
    // const newConf = this.graph.compile();
    // console.log(newConf)
    // this.technique = new Technique({
    //   programConfig: newConf
    // });
    // this.mesh.technique = this.technique;
  }

  loadScene() {
    let testGeo = new SphereGeometry(1, 40, 40);
    const mesh = new Mesh();
    mesh.geometry = testGeo;
    mesh.technique = new Technique(this.shader);
    this.mesh = mesh;
    this.scene.root.addChild(mesh);
  }

  canvasRun: boolean = false;
  start() {
    this.canvasRun = true;
  }

  tick = () => {
    if (this.canvasRun) {
      this.render();
    }
    window.requestAnimationFrame(this.tick);
  }

  render() {
    this.orbitController.update();
    this.engine.connectCamera();
    this.engine.render(this.scene);
  }

  uninit() {
    this.canvas = null;
    this.engine = null;
  }

  private onContainerResize = () => {
    const width = this.canvas.offsetWidth;
    const height = this.canvas.offsetHeight;
    this.engine.setSize(width, height);
    (this.engine.camera as PerspectiveCamera).aspect = width / height;
  }


}


export let ShaderApp: ShaderApplication = new ShaderApplication();