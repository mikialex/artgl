import ARTGL from '../../src/export';
import { ARTEngine, Mesh, PerspectiveCamera, Interactor, OrbitController, Matrix4, PlaneGeometry, Geometry, NormalTechnique, OBJLoader } from '../../src/artgl';
import { Scene } from '../../src/scene/scene';
import { SceneNode } from '../../src/scene/scene-node';
import { RenderGraph } from '../../src/render-graph/render-graph';
import { DimensionType, PixelFormat } from '../../src/render-graph/interface';
import { TAATechnique } from '../../src/technique/technique-lib/taa-technique';
import { DepthTechnique } from '../../src/technique/technique-lib/depth-technique';
import { CopyTechnique } from '../../src/technique/technique-lib/copy-technique';
import { InnerSupportUniform } from '../../src/webgl/uniform/uniform';
import hierachyBallBuilder from './scene/hierachy-balls';
import { createConf } from './conf';

export const STATICSERVER = "http://localhost:3000/"

export class Application {
  graph: RenderGraph;
  engine: ARTEngine;
  el: HTMLCanvasElement;
  hasInitialized: boolean = false;
  scene: Scene = new Scene();
  active: boolean = true;
  interactor: Interactor;
  orbitControler: OrbitController;
  taaTech: TAATechnique;
  enableTAA = false;
  conf;
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
    this.orbitControler = new OrbitController(this.engine.camera as PerspectiveCamera);
    this.orbitControler.registerInteractor(this.interactor);
    this.hasInitialized = true;
    this.createScene(this.scene);

    this.graph.registSource('AllScreen', this.scene)
    const TAATech = new TAATechnique();
    this.taaTech = TAATech;
    this.graph.registTechnique('depthTech', new DepthTechnique())
    this.graph.registTechnique('TAATech', TAATech)
    this.graph.registTechnique('copyTech', new CopyTechnique());
    this.graph.setGraph({
      renderTargets: [
        {
          name: 'screen',
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
      ],
      passes: [
        { // general scene origin
          name: "SceneOrigin",
          source: ['AllScreen'],
        },
        { // depth
          name: "Depth",
          technique: 'depthTech',
          source: ['AllScreen'],
        },
        { // mix newrender and old samples
          name: "TAA",
          inputs: () => {
            return {
              sceneResult: "sceneResult",
              depthResult: "depthResult",
              TAAHistoryOld: this.isEvenTick ? "TAAHistoryA" : "TAAHistoryB"
            }
          },
          technique: 'TAATech',
          source: ['artgl.screenQuad'],
          enableColorClear: false,
          beforePassExecute: () => {
            this.engine.unjit();
            const VPInv: Matrix4 = TAATech.uniforms.get('VPMatrixInverse').value;
            const VP: Matrix4 = this.engine.globalUniforms.get(InnerSupportUniform.VPMatrix).value
            VPInv.getInverse(VP, true);
            TAATech.uniforms.get('VPMatrixInverse').setValueNeedUpdate();
            TAATech.uniforms.get('u_sampleCount').setValue(this.sampleCount);
          },
          afterPassExecute: () => {
            this.sampleCount++;
          }
        },
        { // copy to screen
          name: "CopyToScreen",
          inputs: () => {
            let cs: string;
            if (this.enableTAA) {
              cs = this.isEvenTick ? "TAAHistoryB" : "TAAHistoryA"
            } else {
              cs = "sceneResult"
            }
            return {
              copySource: cs
            }
          },
          technique: 'copyTech',
          source: ['artgl.screenQuad'],
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
    this.active = false;
    window.cancelAnimationFrame(this.tickId);
    window.removeEventListener('resize', this.onContainerResize);
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
  render = () => {
    this.tickNum++;
    this.orbitControler.update();

    this.engine.connectCamera();
    if (this.engine.isCameraChanged) {
      this.sampleCount = 0;
    } else {
      if (this.enableTAA) {
        this.engine.jitterProjectionMatrix();
      }
    }

    // this.engine.renderer.state.colorbuffer.clear();
    // this.engine.renderer.state.depthbuffer.clear();
    // this.engine.render(this.scene)

    if (this.sampleCount <= 100) {
      this.graph.update();
      this.graph.render();
    }
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
    this.loadOBJFromURL();
    return scene;
  }

  async loadOBJFromURL() {
    const objLoader = new OBJLoader();
    const response = await fetch(STATICSERVER + 'obj/chair.obj');
    const result = await response.text();
    const geo = objLoader.parse(result);
    const mesh = new Mesh();
    mesh.geometry = geo;
    mesh.technique = new NormalTechnique();
    this.scene.root.addChild(mesh);
  }

}

export let GLApp: Application = new Application();