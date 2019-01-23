import ARTGL from '../../src/export';
import { ARTEngine, Mesh, PerspectiveCamera, Interactor, OrbitController, Matrix4 } from '../../src/artgl';
import { Scene } from '../../src/scene/scene';
import { SceneNode } from '../../src/scene/scene-node';
import { RenderGraph } from '../../src/render-graph/render-graph';
import { DimensionType, PixelFormat } from '../../src/render-graph/interface';
import { TAATechnique } from '../../src/technique/technique-lib/taa-technique';
import { DepthTechnique } from '../../src/technique/technique-lib/depth-technique';
import { CopyTechnique } from '../../src/technique/technique-lib/copy-technique';
import { Vector4 } from '../../src/math/vector4';
import { InnerSupportUniform } from '../../src/webgl/uniform/uniform';
export class Application{
  graph: RenderGraph;
  engine: ARTEngine;
  el: HTMLCanvasElement;
  hasInitialized: boolean = false;
  scene: Scene = new Scene();
  active: boolean = false;
  interactor: Interactor;
  orbitControler: OrbitController;
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
    window.addEventListener('resize', this.onContainerResize);
    this.onContainerResize();

    this.graph.registSource('AllScreen', this.scene)
    const TAATech = new TAATechnique();
    this.graph.registTechnique('depthTech', new DepthTechnique())
    this.graph.registTechnique('TAATech', TAATech)
    this.graph.registTechnique('copyTech', new CopyTechnique());
    this.graph.setGraph({
      renderTextures: [
        {
          name: 'sceneResult',
          format: {
            pixelFormat: PixelFormat.rgba,
            dimensionType: DimensionType.fixed,
            width: 500,
            height: 500
          },
        },
        {
          name: 'depthResult',
          format: {
            pixelFormat: PixelFormat.rgba,
            dimensionType: DimensionType.fixed,
            width: 500,
            height: 500
          },
        },
        {
          name: 'TAAHistoryA',
          format: {
            pixelFormat: PixelFormat.rgba,
            dimensionType: DimensionType.fixed,
            width: 500,
            height: 500
          },
        },
        {
          name: 'TAAHistoryB',
          format: {
            pixelFormat: PixelFormat.rgba,
            dimensionType: DimensionType.fixed,
            width: 500,
            height: 500
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
          name: "genNewTAAHistory",
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
            TAATech.uniforms.get('VPMatrixInverse').needUpdate = true;

            console.log(this.sampleCount)
            TAATech.uniforms.get('u_sampleCount').value = this.sampleCount;
          },
          afterPassExecute: () => {
            // this.graph.swapRenderTexture('TAAHistoryA', 'TAAHistoryB');
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
          beforePassExecute: () => {
          },
          afterPassExecute: () => {
            this.graph.swapRenderTexture('TAAHistoryA', 'TAAHistoryB');
          }
        },
      ]
    })
  }

  unintialize() {
    this.active = false;
    window.cancelAnimationFrame(this.tickId);
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

  private sampleCount = 0;
  render = () => {
    this.orbitControler.update();
    this.engine.connectCamera();
    if (this.engine.isCameraChanged) {
      this.sampleCount = 0;
    }
    this.engine.jitterProjectionMatrix();

    // this.engine.renderer.setRenderTargetScreen();
    // this.engine.render(this.scene);

    if (this.sampleCount <= 100) {
      this.graph.render();
    }
    if (this.active) {
      window.requestAnimationFrame(this.render);
    }
  }

  tickId;
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
    let testGeo = new ARTGL.SphereGeometry(1, 40, 40);
    let testTec = new ARTGL.NormalTechnique();
    for (let i = 0; i < 5; i++) {
      const node = new SceneNode();
      node.transform.position.x = i;
      scene.root.addChild(node);
      for (let j = 0; j < 5; j++) {
        const node2 = new SceneNode();
        node2.transform.position.y = j;
        node.addChild(node2);
        for (let k = 0; k < 5; k++) {
          const testMesh = new Mesh();
          testMesh.geometry = testGeo;
          testMesh.technique = testTec;
          testMesh.transform.position.z = k;
          testMesh.transform.scale.set(0.3, 0.3, 0.3);
          node2.addChild(testMesh);
        }
      }
    }
    return scene;
  }

}

export let GLApp: Application = new Application();