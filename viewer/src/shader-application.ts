import { ShaderGraph } from '../../src/shader-graph/shader-graph';
import { InnerSupportUniform } from '../../src/webgl/uniform/uniform';
import { ARTEngine, Technique, Mesh, Interactor, OrbitController, PerspectiveCamera } from '../../src/artgl';
import { GLDataType } from '../../src/webgl/shader-util';
import { ShaderFunction } from '../../src/shader-graph/shader-function';
import { Scene } from '../../src/scene/scene';
import ARTGL from '../../src/export';
import { AttributeUsage } from '../../src/webgl/attribute';
import { GLTextureType } from '../../src/webgl/uniform/uniform-texture';

export class ShaderApplication {

  canvas: HTMLCanvasElement;
  graph: ShaderGraph = new ShaderGraph();
  scene: Scene = new Scene();

  technique: Technique;
  mesh: Mesh;
  interactor: Interactor;
  orbitController: OrbitController;

  engine: ARTEngine;


  init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.engine = new ARTEngine(canvas);
    this.engine.camera.transform.position.set(20, 10, 10)
    this.interactor = new Interactor(canvas);
    this.orbitController = new OrbitController(this.engine.camera as PerspectiveCamera);
    this.orbitController.registerInteractor(this.interactor);
    this.technique = new ARTGL.NormalTechnique();
    this.loadScene();
    this.tick();
    this.start();


    // this.graph.setGraph({
    //   uniforms: [
    //     { name: 'u_color1', type: GLDataType.floatVec3 },
    //     { name: 'u_color2', type: GLDataType.floatVec3 },
    //   ],

    //   uniformsIncludes: [
    //     { name: 'MMatrix', mapInner: InnerSupportUniform.MMatrix, },
    //     { name: 'VPMatrix', mapInner: InnerSupportUniform.VPMatrix, }
    //   ],

    //   textures: [
    //     { name: 'copySource', type: GLTextureType.texture2D },
    //   ],

    //   varyings: [
    //     { name: 'color', type: GLDataType.floatVec3 }
    //   ],

    //   attributes: [
    //     { name: 'position', type: GLDataType.floatVec3, usage: AttributeUsage.position },
    //     { name: 'normal', type: GLDataType.floatVec3, usage: AttributeUsage.normal },
    //   ],


    //   // declare your fragment shader graph
    //   // fragment shader graph should have a root node
    //   // which output is gl_FragColor as the screen fragment output
    //   effect: [
    //     {
    //       name: "effectOutput",
    //       type: "composeAddVec4",
    //       input: {
    //         sourceA: {
    //           type: ShaderGraphNodeInputType.shaderFunctionNode,
    //           value: "diffuse"
    //         },
    //         sourceB: {
    //           type: ShaderGraphNodeInputType.shaderFunctionNode,
    //           value: "IBL"
    //         },
    //       }
    //     },
    //     {
    //       name: "diffuse",
    //       type: "diffuse",
    //       input: {
    //         diffuseColor: {
    //           type: ShaderGraphNodeInputType.commonUniform,
    //           value: "u_color1"
    //         }
    //       }
    //     },
    //     {
    //       name: "IBL",
    //       type: "diffuse",
    //       input: {
    //         diffuseColor: {
    //           type: ShaderGraphNodeInputType.commonUniform,
    //           value: "u_color2"
    //         }
    //       }
    //     },
    //   ],
    //   effectRoot: "effectOutput",

    //   // declare your vertex shader graph
    //   // like frag, we export the graph root as gl_Position
    //   transform: [
    //     {
    //       name: "transformOutput",
    //       type: "VPtransform",
    //       input: {
    //         VPMatrix: {
    //           type: ShaderGraphNodeInputType.innerUniform,
    //           value: "VPMatrix"
    //         },
    //         MMatrix: {
    //           type: ShaderGraphNodeInputType.innerUniform,
    //           value: "MMatrix"
    //         },
    //         position: {
    //           type: ShaderGraphNodeInputType.attribute,
    //           value: "position"
    //         }
    //       }
    //     },
    //   ],
    //   transformRoot: "transformOutput",


    // })

    window.addEventListener('resize', this.onContainerResize);
    this.onContainerResize();
  }

  updateShader() {
    // const newConf = this.graph.compile();
    // console.log(newConf)
    // this.technique = new Technique({
    //   programConfig: newConf
    // });
    // this.mesh.technique = this.technique;
  }

  loadScene() {
    let testGeo = new ARTGL.SphereGeometry(1, 40, 40);
    const mesh = new Mesh();
    mesh.geometry = testGeo;
    mesh.technique = this.technique;
    this.mesh = mesh;
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
    this.orbitController.update();
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