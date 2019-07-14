import ARTGL from '../../src/export';
import { ARTEngine, Mesh, PerspectiveCamera, Interactor, OrbitController, Matrix4, PlaneGeometry, Geometry, OBJLoader, Technique, NormalShading } from '../../src/artgl';
import { Scene } from '../../src/scene/scene';
import { SceneNode } from '../../src/scene/scene-node';
import { RenderGraph } from '../../src/render-graph/render-graph';
import { DimensionType, PixelFormat } from '../../src/render-graph/interface';
import { TAAShading } from '../../src/technique/technique-lib/taa-technique';
import { SSAOShading } from '../../src/technique/technique-lib/ssao-technique';
import { DepthShading } from '../../src/technique/technique-lib/depth-technique';
import { TSSAOBlendShading } from '../../src/technique/technique-lib/blend-technique';
import { InnerSupportUniform } from '../../src/webgl/uniform/uniform';
import hierachyBallBuilder from './scene/hierachy-balls';
import { createConf } from './conf';
import { Observable } from '../../src/core/observable';
import { RenderConfig } from './components/conf/interface';
import { Camera } from '../../src/core/camera';

export const STATICSERVER = "http://localhost:3000/"

export class Application {
  graph: RenderGraph;
  engine: ARTEngine;
  el: HTMLCanvasElement;
  hasInitialized: boolean = false;
  scene: Scene = new Scene();
  active: boolean = false;
  interactor: Interactor;
  orbitController: OrbitController;

  lightCamera: Camera;

  taaTech: Technique = new Technique(new TAAShading);
  enableTAA = true;

  enableTSSAO = true;
  tssaoTech: Technique = new Technique(new SSAOShading);

  composeTech: Technique = new Technique(new TSSAOBlendShading);

  conf: RenderConfig;
  private tickNum = 0;
  get isEvenTick() {
    return this.tickNum % 2 === 0;
  }
  initialize(canvas: HTMLCanvasElement) {
    this.el = canvas;
    this.engine = new ARTEngine(canvas);
    this.graph = new RenderGraph(this.engine);
    this.engine.camera.transform.position.set(20, 10, 10)
    this.interactor = new Interactor(canvas);
    this.orbitController = new OrbitController(this.engine.camera as PerspectiveCamera);
    this.orbitController.registerInteractor(this.interactor);
    this.hasInitialized = true;
    this.createScene(this.scene);

    const depthTech = new Technique( new DepthShading())
    
    this.graph.setGraph({
      renderTargets: [
        {
          name: RenderGraph.screenRoot,
          from: () => 'CopyToScreen',
        },
        {
          name: 'sceneResult',
          from: () => 'SceneOrigin',
        },
        {
          name: 'depthResult',
          from: () => 'Depth',
        },
        {
          name: 'TAAHistoryA',
          from: () => this.isEvenTick ? null : 'TAA',
        },
        {
          name: 'TAAHistoryB',
          from: () => this.isEvenTick ? 'TAA' : null,
        },
        {
          name: 'SSAOHistoryA',
          from: () => this.isEvenTick ? null : 'SSAO',
        },
        {
          name: 'SSAOHistoryB',
          from: () => this.isEvenTick ? 'SSAO' : null,
        },
      ],
      passes: [
        { // general scene origin
          name: "SceneOrigin",
          source: [this.scene],
        },
        { // depth
          name: "Depth",
          technique: depthTech,
          source: [this.scene],
        },
        { // mix new render and old samples
          name: "TAA",
          inputs: () => {
            return {
              sceneResult: "sceneResult",
              depthResult: "depthResult",
              TAAHistoryOld: this.isEvenTick ? "TAAHistoryA" : "TAAHistoryB",
            }
          },
          technique: this.taaTech,
          source: [RenderGraph.quadSource],
          enableColorClear: false,
          beforePassExecute: () => {
            this.engine.unJit();
            const VPInv: Matrix4 = this.taaTech.uniforms.get('VPMatrixInverse').value;
            const VP: Matrix4 = this.engine.getGlobalUniform(InnerSupportUniform.VPMatrix).value
            VPInv.getInverse(VP, true);
            this.taaTech.uniforms.get('VPMatrixInverse').setValueNeedUpdate();
            this.taaTech.uniforms.get('u_sampleCount').setValue(this.sampleCount);
          },
        },
        {
          name: "SSAO",
          inputs: () => {
            return {
              depthResult: "depthResult",
              AOAcc: this.isEvenTick ? "SSAOHistoryA" : "SSAOHistoryB",
            }
          },
          technique: this.tssaoTech,
          source: [RenderGraph.quadSource],
          enableColorClear: false,
          beforePassExecute: () => {
            const VPInv: Matrix4 = this.tssaoTech.uniforms.get('VPMatrixInverse').value;
            const VP: Matrix4 = this.engine.getGlobalUniform(InnerSupportUniform.VPMatrix).value
            VPInv.getInverse(VP, true);
            this.tssaoTech.uniforms.get('VPMatrixInverse').setValueNeedUpdate();
            this.tssaoTech.uniforms.get('u_sampleCount').setValue(this.sampleCount);
          },
        },
        { // copy to screen
          name: "CopyToScreen",
          enableColorClear: false,
          inputs: () => {
            let basic: string;
            let tssao: string;
            if (this.enableTAA) {
              basic = this.isEvenTick ? "TAAHistoryB" : "TAAHistoryA"
            } else {
              basic = "sceneResult"
            }
            if (this.enableTSSAO){
              tssao = this.isEvenTick ? "SSAOHistoryB" : "SSAOHistoryA"
            }else{
              tssao = "sceneResult" // TODO consider design a way to bind default empty source? or recompile shader?
            }
            return {basic, tssao}
          },
          beforePassExecute: () =>{
            this.composeTech.uniforms.get('u_sampleCount').setValue(this.sampleCount);
          },
          afterPassExecute: () => {
            this.sampleCount++;
          },
          technique: this.composeTech,
          source: [RenderGraph.quadSource],
        },
      ]
    })

    window.addEventListener('resize', this.onContainerResize);
    this.onContainerResize();
    this.conf = createConf(this);
    if (this.active) {
      this.run();
    }
  }

  unintialize() {
    window.cancelAnimationFrame(this.tickId);
    window.removeEventListener('resize', this.onContainerResize);
    this.active = false;
    this.engine = null;
    this.graph = null;
    this.el = null;
  }

  private onContainerResize = () => {
    const width = this.el.offsetWidth;
    const height = this.el.offsetHeight;
    this.engine.setSize(width, height);
    (this.engine.camera as PerspectiveCamera).aspect = width / height;

    this.taaTech.uniforms.get('screenPixelXStep').setValue(1 / (2 * window.devicePixelRatio * width));
    this.taaTech.uniforms.get('screenPixelYStep').setValue(1 / (2 * window.devicePixelRatio * height));
  }
  notifyResize() {
    this.onContainerResize();
  }

  sampleCount = 0;
  beforeRender: Observable<ARTEngine> = new Observable();
  afterRender: Observable<ARTEngine> = new Observable();
  render = () => {
    this.beforeRender.notifyObservers(this.engine);
    this.tickNum++;
    this.orbitController.update();

    this.engine.connectCamera();
    if (this.engine.isCameraChanged || this.scene.isFrameChange) {
      this.sampleCount = 0;
    } else {
      if (this.enableTAA) {
        this.engine.jitterProjectionMatrix();
      }
    }

    // if (this.sampleCount <= 100) {
      this.graph.update();
      this.graph.render();
    // }

    this.afterRender.notifyObservers(this.engine);
    this.engine.renderer.stat.reset();

    if (this.active) {
      window.requestAnimationFrame(this.render);
    }
  }

  private tickId: number;
  run() {
    this.active = true;
    this.interactor.enabled = true;
    this.tickId = window.requestAnimationFrame(this.render);
  }

  stop() {
    this.active = false;
    this.interactor.enabled = false;
    window.cancelAnimationFrame(this.tickId);
  }

  step() {
    this.render();
  }

  createScene(scene: Scene): Scene {
    hierachyBallBuilder(scene.root);
    // this.loadOBJFromURL();
    return scene;
  }

  async loadOBJFromURL() {
    const objLoader = new OBJLoader();
    const response = await fetch(STATICSERVER + 'obj/chair.obj');
    const result = await response.text();
    const geo = objLoader.parse(result);
    const mesh = new Mesh();
    mesh.geometry = geo;
    mesh.technique = new Technique(new NormalShading());
    this.scene.root.addChild(mesh);
  }

}

export let GLApp: Application = new Application();