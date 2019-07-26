import {
  RenderEngine, Mesh, PerspectiveCamera, Interactor, OrbitController,
  OBJLoader, NormalShading, Scene, Observable, Framer
} from '../../src/artgl';

import hierarchyBallBuilder from './scene/hierarchy-balls';
import { createConf } from './conf';
import { RenderConfig } from './components/conf/interface';
import { RenderPipeline } from './RenderPipeline';

export const STATIC_SERVER = "http://localhost:3000/"

export class Application {
  pipeline: RenderPipeline;
  engine: RenderEngine;
  framer: Framer = new Framer();
  el: HTMLCanvasElement;
  hasInitialized: boolean = false;
  scene: Scene = new Scene();
  interactor: Interactor;
  orbitController: OrbitController;

  conf: RenderConfig;

  initialize(canvas: HTMLCanvasElement) {
    this.el = canvas;
    this.engine = new RenderEngine(canvas);
    this.pipeline = new RenderPipeline();
    this.pipeline.build(this.engine, this.scene);
    this.engine.camera.transform.position.set(20, 10, 10)
    this.interactor = new Interactor(canvas);
    this.orbitController = new OrbitController(this.engine.camera as PerspectiveCamera);
    this.orbitController.registerInteractor(this.interactor);
    this.hasInitialized = true;
    this.createScene(this.scene);

    window.addEventListener('resize', this.onContainerResize);
    this.onContainerResize();
    this.conf = createConf(this);
    this.framer.setFrame(this.render);
  }

  unintialize() {
    window.removeEventListener('resize', this.onContainerResize);
    this.engine = null;
    this.pipeline = null;
    this.framer.stop();
    this.framer = null;
    this.el = null;
  }

  private onContainerResize = () => {
    const width = this.el.offsetWidth;
    const height = this.el.offsetHeight;
    this.engine.setSize(width, height);
    (this.engine.camera as PerspectiveCamera).aspect = width / height;

    // this.taaTech.uniforms.get('screenPixelXStep').setValue(1 / (2 * window.devicePixelRatio * width));
    // this.taaTech.uniforms.get('screenPixelYStep').setValue(1 / (2 * window.devicePixelRatio * height));
  }
  notifyResize() {
    this.onContainerResize();
  }

  sampleCount = 0;
  beforeRender: Observable<RenderEngine> = new Observable();
  afterRender: Observable<RenderEngine> = new Observable();
  render = () => {
    this.beforeRender.notifyObservers(this.engine);
    this.orbitController.update();

    this.pipeline.render(this.engine, this.scene);

    this.afterRender.notifyObservers(this.engine);
    this.engine.renderer.stat.reset();

  }

  pickColor(x: number, y: number) {
    const f = this.engine.renderer.framebufferManager.getFramebuffer("sceneResult");
    const result = new Uint8Array(10);
    f.readPixels(x, y, 1, 1, result);
    console.log(`${result[0]}`)
  }

  run() {
    this.interactor.enabled = true;
    this.framer.run();
  }

  stop() {
    this.interactor.enabled = false;
    this.framer.stop();
  }

  step() {
    this.framer.step();
  }

  createScene(scene: Scene): Scene {
    hierarchyBallBuilder(scene.root);
    // this.loadOBJFromURL();
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

export let GLApp: Application = new Application();