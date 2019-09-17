import {
  RenderEngine, Mesh, PerspectiveCamera, OrbitController,
  OBJLoader, Scene, Observable, Framer, Material, Geometry, Shading, RenderObject,
} from '../../src/artgl';

import hierarchyBallBuilder from './scene/hierarchy-balls';
import { AdvanceStaticRenderPipeline } from './advance-static-pipeline';
import { Raycaster } from '../../src/core/raycaster';
import { SkyBackground } from '../../src/scene/background';

export const STATIC_SERVER = "http://localhost:3000/"

export class Application {
  constructor(canvas: HTMLCanvasElement) {
    this.el = canvas;
    this.engine = new RenderEngine(canvas);
    this.pipeline = new AdvanceStaticRenderPipeline(this.engine);

    this.engine.camera.bindEngineRenderSize(this.engine);
    this.engine.camera.transform.position.set(5, 5, 5)

    this.orbitController = new OrbitController(this.engine.camera as PerspectiveCamera);
    this.orbitController.registerInteractor(this.engine.interactor);
    this.createScene(this.scene);

    window.addEventListener('resize', this.onContainerResize);
    this.onContainerResize();
    this.framer.setFrame(this.render);

    this.scene.background = new SkyBackground()
  }

  pipeline: AdvanceStaticRenderPipeline;
  engine: RenderEngine;
  framer: Framer = new Framer();
  el: HTMLCanvasElement;

  scene: Scene = new Scene();
  
  materials: Material[] = [];
  geometries: Geometry[] = [];
  shadings: Shading[] = [];

  orbitController: OrbitController;
  raycaster: Raycaster = new Raycaster();
  
  unintialize() {
    window.removeEventListener('resize', this.onContainerResize);
    this.framer.stop();
    this.framer.setFrame(() => { });
  }

  private onContainerResize = () => {
    const width = this.el.offsetWidth;
    const height = this.el.offsetHeight;
    this.engine.setSize(width, height);
    this.pipeline.resetSample();
  }
  notifyResize() {
    this.onContainerResize();
  }

  beforeRender: Observable<RenderEngine> = new Observable();
  afterRender: Observable<RenderEngine> = new Observable();
  render = () => {
    this.beforeRender.notifyObservers(this.engine);
    this.orbitController.update();

    this.pipeline.render(this.scene);

    this.afterRender.notifyObservers(this.engine);
    this.engine.renderer.stat.reset();

  }

  pick(x: number, y: number) {

    this.raycaster.update(this.engine.camera as PerspectiveCamera, x * 2 - 1, y * 2 - 1);
    const resultCast = this.raycaster.pickFirst(this.scene);
    if (resultCast !== undefined) {
      this.pipeline.dof.focusLength = resultCast.cameraDistance;
      this.pipeline.resetSample();
      this.scene.select(resultCast.object as unknown as RenderObject);
    }
    console.log(resultCast);

    return;
    // TODO
    // const f = this.pipeline.getFramebufferByName("sceneResult")!;
    // const result = new Uint8Array(10);
    // f.readPixels(
    //   x * this.engine.renderer.width,
    //   y * this.engine.renderer.height,
    //   1, 1, result);
    // console.log(`${result[0]}`)

    // console.log(resultCast.map(re => re.object.geometry.constructor.name));
  }

  run() {
    this.engine.interactor.enabled = true;
    this.framer.run();
  }

  stop() {
    this.engine.interactor.enabled = false;
    this.framer.stop();
  }

  step() {
    this.framer.step();
  }

  createScene(scene: Scene): Scene {
    const config = hierarchyBallBuilder(scene.root, this);
    // this.loadOBJFromURL();
    this.pipeline.config.value.push(config);
    return scene;
  }

  async loadOBJFromURL() {
    const objLoader = new OBJLoader();
    const response = await fetch(STATIC_SERVER + 'obj/chair.obj');
    const result = await response.text();
    const geo = objLoader.parse(result);
    const mesh = new Mesh();
    mesh.geometry = geo;
    this.scene.root.addChild(mesh);
  }

}
