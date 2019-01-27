import ARTGL from '../../src/export';
import { ARTEngine, Mesh, PerspectiveCamera, Interactor, OrbitController, Matrix4, PlaneGeometry } from '../../src/artgl';
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


export class Application{
  graph: RenderGraph;
  engine: ARTEngine;
  el: HTMLCanvasElement;
  hasInitialized: boolean = false;
  scene: Scene = new Scene();
  active: boolean = false;
  interactor: Interactor;
  orbitControler: OrbitController;
  taaTech: TAATechnique;
  conf
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
      renderTextures: [
        {
          name: 'sceneResult',
          format: {
            pixelFormat: PixelFormat.rgba,
            dimensionType: DimensionType.bindRenderSize,
          },
        },
        {
          name: 'depthResult',
          format: {
            pixelFormat: PixelFormat.rgba,
            dimensionType: DimensionType.bindRenderSize,
          },
        },
        {
          name: 'TAAHistoryA',
          format: {
            pixelFormat: PixelFormat.rgba,
            dimensionType: DimensionType.bindRenderSize,
          },
        },
        {
          name: 'TAAHistoryB',
          format: {
            pixelFormat: PixelFormat.rgba,
            dimensionType: DimensionType.bindRenderSize,
          },
        },
      ],
      passes: [
        { // general scene origin
          name: "SceneOrigin",
          output: "sceneResult",
          source: ['AllScreen'],
        },
        { // depth
          name: "Depth",
          technique: 'depthTech',
          output: "depthResult",
          source: ['AllScreen'],
        },
        { // mix newrender and old samples
          name: "TAA",
          inputs: [
            { name: "sceneResult", mapTo: "sceneResult"},
            { name: "depthResult", mapTo: "depthResult"},
            { name: "TAAHistoryA", mapTo: "TAAHistoryOld"}
          ],
          technique: 'TAATech',
          source: ['artgl.screenQuad'],
          output: 'TAAHistoryB',
          enableColorClear: false,
          beforePassExecute: () => {
            this.engine.unjit();
            const VPInv: Matrix4 = TAATech.uniforms.get('VPMatrixInverse').value;
            const VP: Matrix4 = this.engine.globalUniforms.get(InnerSupportUniform.VPMatrix).value
            VPInv.getInverse(VP, true);
            TAATech.uniforms.get('VPMatrixInverse').setValueNeedUpdate();
            // console.log(this.sampleCount)
            TAATech.uniforms.get('u_sampleCount').setValue(this.sampleCount);
          },
          afterPassExecute: () => {
            this.sampleCount++;
          }
        },
        { // copy to screen
          name: "CopyToScreen",
          inputs: [
            { name: "TAAHistoryB", mapTo: "copySource" },
          ],
          output: "screen",
          technique: 'copyTech',
          source: ['artgl.screenQuad'],
          afterPassExecute: () => {
            this.graph.swapRenderTexture('TAAHistoryA', 'TAAHistoryB');
          }
        },
      ]
    })

    window.addEventListener('resize', this.onContainerResize);
    this.onContainerResize();
    this.conf = createConf(this);
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

    this.taaTech.uniforms.get('screenPixelXStep').setValue(1 / ( 2 * window.devicePixelRatio * width));
    this.taaTech.uniforms.get('screenPixelYStep').setValue(1 / ( 2 * window.devicePixelRatio * height));
  }
  notifyResize() {
    this.onContainerResize();
  }

  sampleCount = 0;
  render = () => {
    this.orbitControler.update();
    this.engine.connectCamera();
    if (this.engine.isCameraChanged) {
      this.sampleCount = 0;
    } else {
      this.engine.jitterProjectionMatrix();
    }

    if (this.sampleCount <= 100) {
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
  }

  createScene(scene: Scene): Scene {
    hierachyBallBuilder(scene.root);
    return scene;
  }

}

export let GLApp: Application = new Application();