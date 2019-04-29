import { ShaderGraph, ShaderGraphNodeInputType } from '../../src/shader-graph/shader-graph';
import { InnerSupportUniform } from '../../src/webgl/uniform/uniform';
import { ARTEngine, Technique, Mesh, Interactor, OrbitController, PerspectiveCamera } from '../../src/artgl';
import { GLDataType } from '../../src/webgl/shader-util';
import { ShaderFunction } from '../../src/shader-graph/shader-function';
import { Scene } from '../../src/scene/scene';
import ARTGL from '../../src/export';

export class ShaderApplication {

  canvas: HTMLCanvasElement;
  graph: ShaderGraph = new ShaderGraph();
  scene: Scene = new Scene();

  technique: Technique;
  interactor: Interactor;
  orbitControler: OrbitController;

  engine: ARTEngine;


  init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.engine = new ARTEngine(canvas);
    this.engine.camera.transform.position.set(20, 10, 10)
    this.interactor = new Interactor(canvas);
    this.orbitControler = new OrbitController(this.engine.camera as PerspectiveCamera);
    this.orbitControler.registerInteractor(this.interactor);
    this.technique = new ARTGL.NormalTechnique();
    this.loadScene();
    this.tick();
    this.start();

    this.graph.registShaderFunction(new ShaderFunction({
      name: 'diffuse',
      source: `
      return vec4(diffuseColor);
        `,
      inputs: [
        {
          name: "diffuseColor",
          type: GLDataType.floatVec3
        }
      ],
      returnType: GLDataType.floatVec4
    }))


    this.graph.setGraph({

      // decalare your fragment shader graph
      // fragment shader graph should have a root node
      // which output is gl_FragColor as the screen fragment output
      effect: [
        {
          name: "result",
          type: "composeAddVec4",
          input: {
            sourceA: {
              type: ShaderGraphNodeInputType.shaderFunctionNode,
              value: "diffuse"
            },
            sourceB: {
              type: ShaderGraphNodeInputType.shaderFunctionNode,
              value: "IBL"
            },
          }
        },
        {
          name: "diffuse",
          type: "diffuse",
          input: {
            diffuseColor: {
              type: ShaderGraphNodeInputType.commenUniform,
            }
          }
        },
        {
          name: "IBL",
          type: "diffuse",
          input: {
            diffuseColor: {
              type: ShaderGraphNodeInputType.textureUniform,
            }
          }
        },
      ],
      effectRoot:"result",
    
      // declare your vertex shader graph
      // like frag, we export the graph root as gl_Position
      transform: [
        {
          name: "root",
          type: "VPtransfrom",
          input: {
            VPMatrix: {
              type: ShaderGraphNodeInputType.commenUniform,
              isInnerValue: true,
              value: InnerSupportUniform.VPMatrix
            },
            position: {
              type: ShaderGraphNodeInputType.attribute,
            }
          }
        },
      ],
      transformRoot:"result",
    
    
    })

    window.addEventListener('resize', this.onContainerResize);
    this.onContainerResize();
  }

  updateShader() {
    const newConf = this.graph.compile();
    this.technique = new Technique({
      programConfig: newConf
    });
  }

  loadScene() {
    let testGeo = new ARTGL.SphereGeometry(1, 40, 40);
    const mesh = new Mesh();
    mesh.geometry = testGeo;
    mesh.technique = this.technique;
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
    this.orbitControler.update();
    this.engine.connectCamera();
    this.engine.render(this.scene);
  }

  uninit() {
    this.canvas = null;
    this.engine = null;
  }

  private onContainerResize = () => {
    const width = this.canvas.offsetWidth;
    const height = this.canvas.offsetHeight;
    this.engine.setSize(width, height);
    (this.engine.camera as PerspectiveCamera).aspect = width / height;
  }


}


export let ShaderApp: ShaderApplication = new ShaderApplication();