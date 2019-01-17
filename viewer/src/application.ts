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
    window.requestAnimationFrame(this.render);
    window.addEventListener('resize', this.onContainerResize);
    this.onContainerResize();

    this.graph.registTechnique('depthTech', new DepthTechnique())
    this.graph.registTechnique('dofTech', new DOFTechnique())
    this.graph.setGraph({
      renderTextures: [
        {
          name: 'Depth',
          format: {
            pixelFormat: PixelFormat.depth,
            dimensionType: DimensionType.screenRelative,
            width: 1,
            height: 1
          },
        },
        {
          name: 'forwardScene',
          format: {
            pixelFormat: PixelFormat.rgba,
            dimensionType: DimensionType.screenRelative,
            width: 1,
            height: 1
          },
        },
      ],
      passes: [
        {
          name: "Forward",
          output: "Depth",
          technique: 'depthTech',
          source: ['All']
        },
        {
          name: "Depth",
          output: "forwardScene",
          source: ['All']
        },
        {
          name: "DOF",
          inputs: ["forwardScene", "Depth"],
          technique: 'dofTech',
          source: ['quad'],
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
    if (this.active) {
      this.orbitControler.update();
      this.engine.connectCamera();
      this.engine.render(this.scene);
      this.graph.render(this.scene);
    }
    window.requestAnimationFrame(this.render);
  }

  run() {
    this.active = true;
    this.interactor.enabled = true;
  }

  stop() {
    this.active = false;
    this.interactor.enabled = false;
  }

}

export let GLApp: Application = new Application();