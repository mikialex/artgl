import {
  RenderEngine, Mesh, PerspectiveCamera, OrbitController, Raycaster, SkyBackground,
  OBJLoader, Scene, Observable, Framer, Material, Geometry, Shading, RenderObject, Vector3,
} from 'artgl/';

import hierarchyBallBuilder from './scene/hierarchy-balls';
import createSceneShading from './scene/scene-shading';
import { AdvanceStaticRenderPipeline } from './advance-static-pipeline';

export const STATIC_SERVER = "http://localhost:3000/"

export class Application {
  constructor(canvas: HTMLCanvasElement) {
    this.el = canvas;
    this.engine = new RenderEngine({ el: canvas });
    this.pipeline = new AdvanceStaticRenderPipeline(this.engine);

    this.camera = new PerspectiveCamera();
    this.camera.transform.position.set(5, 5, 5);
    this.camera.lookAt(new Vector3(0, 0, 0));
    this.camera.updateRenderRatio(this.engine);

    this.orbitController = new OrbitController(this.camera);
    this.orbitController.registerInteractor(this.engine.interactor);
    this.createScene(this.scene);

    window.addEventListener('resize', this.onContainerResize);
    this.onContainerResize();
    this.framer.setFrame(this.render);

    this.scene.background = new SkyBackground()
  }

  camera: PerspectiveCamera;
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
    this.camera.updateRenderRatio(this.engine);
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

    this.pipeline.render(this.scene, this.camera);

    this.afterRender.notifyObservers(this.engine);
    this.engine.renderer.stat.reset();

  }

  pick(x: number, y: number) {

    this.raycaster.update(this.camera, x * 2 - 1, y * 2 - 1);
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
    const { config, shading } = createSceneShading(this);
    this.pipeline.sceneShading = shading;
    hierarchyBallBuilder(scene.root, this, this.pipeline.sceneShading);
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
