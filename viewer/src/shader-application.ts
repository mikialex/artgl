
import {
  RenderEngine, Mesh, OrbitController, Shading,
  ShaderGraph, PerspectiveCamera, Scene, NormalShading, SphereGeometry
} from '../../src/artgl';

export class ShaderApplication {
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.engine = new RenderEngine({ el: canvas });

    this.camera.transform.position.set(20, 10, 10)
    this.camera.updateRenderRatio(this.engine);

    this.orbitController = new OrbitController(this.camera);
    this.orbitController.registerInteractor(this.engine.interactor);
    this.shader = new Shading().decorate(new NormalShading());
    // this.loadScene();
    // this.tick();
    // this.start();

    window.addEventListener('resize', this.onContainerResize);
    this.onContainerResize();
  }

  canvas: HTMLCanvasElement;
  graph: ShaderGraph = new ShaderGraph();
  scene: Scene = new Scene();
  camera: PerspectiveCamera = new PerspectiveCamera();

  shader: Shading;
  mesh: Mesh = new Mesh();
  orbitController: OrbitController;

  engine: RenderEngine;


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
    mesh.shading = this.shader;
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
    this.engine.render(this.scene);
  }

  private onContainerResize = () => {
    const width = this.canvas.offsetWidth;
    const height = this.canvas.offsetHeight;
    this.engine.setSize(width, height);
    (this.camera).aspect = width / height;
  }


}
