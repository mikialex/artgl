import ARTGL from '../../src/export';
import { ARTEngine, Mesh, PerspectiveCamera, Interactor, OrbitController } from '../../src/artgl';
import { Scene } from '../../src/scene/scene';
import { SceneNode } from '../../src/scene/scene-node';
import { RenderGraph } from '../../src/render-graph/render-graph';
import { DimensionType, PixelFormat } from '../../src/render-graph/interface';
import { DOFTechnique } from '../../src/technique/technique-lib/dof-technique';
import { DepthTechnique } from '../../src/technique/technique-lib/depth-technique';
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

    this.graph.registSource('All',this.scene)
    this.graph.registTechnique('depthTech', new DepthTechnique())
    this.graph.registTechnique('dofTech', new DOFTechnique())
    this.graph.setGraph({
      renderTextures: [
        {
          name: 'depthBuffer',
          format: {
            pixelFormat: PixelFormat.depth,
            dimensionType: DimensionType.fixed,
            width: 500,
            height: 500
          },
        },
        {
          name: 'sceneBuffer',
          format: {
            pixelFormat: PixelFormat.rgba,
            dimensionType: DimensionType.fixed,
            width: 500,
            height: 500
          },
        },
      ],
      passes: [
        {
          name: "Depth",
          output: "depthBuffer",
          technique: 'depthTech',
          source: ['All']
        },
        {
          name: "SceneOrigin",
          output: "sceneBuffer",
          source: ['All'],
        },
        {
          name: "DOF",
          inputs: ["depthBuffer", "sceneBuffer"],
          technique: 'dofTech',
          source: ['artgl.screenQuad'],
          output: 'screen',
        }
      ]
    })
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

  render = () => {
    this.orbitControler.update();
    this.engine.connectCamera();

    // this.engine.renderer.setRenderTargetScreen();
    // this.engine.render(this.scene);

    this.graph.render();
    if (this.active) {
      window.requestAnimationFrame(this.render);
    }
  }

  run() {
    this.active = true;
    this.interactor.enabled = true;
    window.requestAnimationFrame(this.render);
  }

  stop() {
    this.active = false;
    this.interactor.enabled = false;
  }

}

export let GLApp: Application = new Application();