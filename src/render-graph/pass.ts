import { GLFramebuffer } from "../webgl/gl-framebuffer";
import { ARTEngine, RenderSource } from "../engine/render-engine";
import { Technique } from "../core/technique";
import { RenderGraph } from "./render-graph";
import { PassDefine, PassInputMapInfo } from "./interface";
import { RenderTargetNode } from "./dag/render-target-node";
import { Vector4 } from "../math/vector4";
import { Nullable } from "../type";

export class RenderPass{
  constructor(graph: RenderGraph, define: PassDefine) {
    this.graph = graph;
    this.define = define;
    this.name = define.name;
    if (define.technique !== undefined) {
      const overrideTechnique = graph.getResgisteredTechnique(define.technique);
      if (overrideTechnique === undefined) {
        throw `technique '${define.technique}' not defined`
      }
      this.overrideTechnique = overrideTechnique;
    }

    this.clearColor = define.clearColor;
    this.enableColorClear = define.enableColorClear === undefined ? true : define.enableColorClear
    this.enableDepthClear = define.enableDepthClear === undefined ? true : define.enableDepthClear

    this.beforePassExecute = define.beforePassExecute;
    this.afterPassExecute = define.afterPassExecute;

    define.source.forEach(so => {
      let renderso: RenderSource;
      if (this.graph.isInnerSourceType(so)) {
        renderso = this.graph.getInnerSource(so);
      } else {
        renderso = graph.getResgisteredSource(so);
        if (renderso === undefined) {
          throw `rendersource '${so}' not defined`
        }
      }
      this.sourceUse.push(renderso);
    })

  }

  updateInputTargets(inputs: PassInputMapInfo) {
    this.inputTarget.clear();
    Object.keys(inputs).forEach(inputKey => {
      const mapTo = inputs[inputKey];
      this.inputTarget.set(inputKey, mapTo)
    })
  }

  private graph: RenderGraph;
  readonly define: PassDefine;
  public name: string;

  private clearColor: Vector4;
  private enableDepthClear: boolean = true;
  private enableColorClear: boolean = true;

  private afterPassExecute?: () => any;
  private beforePassExecute?: () => any;
  

  private sourceUse: RenderSource[] = [];
  private overrideTechnique: Nullable<Technique> = null;

  // key: uniformName ;   value: inputFrambufferName
  private inputTarget: Map<string, string> = new Map();
  private outputTarget: GLFramebuffer
  setOutPutTarget(renderTargetNode: RenderTargetNode) {
    if (renderTargetNode.name === RenderGraph.screenRoot) {
      this.outputTarget = undefined;
      this.isOutputScreen = true;
    } else {
      this.outputTarget = renderTargetNode.framebuffer;
      this.isOutputScreen = false;
    }
  }
  private isOutputScreen: boolean = true;

  renderDebugResult(engine: ARTEngine) {
    engine.renderDebugFrameBuffer(this.outputTarget)
    // this will cause no use draw TODO
    this.inputTarget.forEach((inputFrambufferName, uniformName) => {
      const framebuffer = engine.renderer.frambufferManager.getFramebuffer(inputFrambufferName);
      engine.renderDebugFrameBuffer(framebuffer)
    })
  }

  renderDebugFramebuffer(engine: ARTEngine, framebuffer: GLFramebuffer) {
    engine.renderer.setRenderTargetScreen();
  }

  static screenDebugViewPort = new Vector4(200, 0, 200, 200)
  execute() {
    const engine = this.graph.engine;
    // if (this.isOutputScreen) {
    //   return
    // }

    // setup viewport and render target
    if (this.isOutputScreen) {
      engine.renderer.setRenderTargetScreen();
      if (this.graph.enableDebuggingView) {
        const debugViewPort = RenderPass.screenDebugViewPort;
        engine.renderer.state.setViewport(
          debugViewPort.x, debugViewPort.y,
          debugViewPort.z, debugViewPort.w
        );

      } else {
        engine.renderer.state.setFullScreenViewPort();
      }
    } else {
      engine.renderer.setRenderTarget(this.outputTarget);
      engine.renderer.state.setViewport(0, 0, this.outputTarget.width, this.outputTarget.height);
    }

    this.checkIsValid();
  
    // input binding 
    if (this.overrideTechnique !== null) {
      engine.overrideTechnique = this.overrideTechnique;
      this.inputTarget.forEach((inputFrambufferName, uniformName) => {
        (engine.overrideTechnique as Technique).getProgram(engine).defineFrameBufferTextureDep(
          inputFrambufferName, uniformName
        );
      })
    }

    // clear setting
    if (this.enableColorClear) {
      if (this.clearColor !== undefined) {
        engine.renderer.state.colorbuffer.setClearColor(this.clearColor);
      }
      engine.renderer.state.colorbuffer.clear();
    }
    if (this.enableDepthClear) {
      if (!this.isOutputScreen && this.outputTarget.enableDepth) {
        engine.renderer.state.depthbuffer.clear();
      }
    }

    if (this.beforePassExecute !== undefined) {
      this.beforePassExecute();
    }

    //////  render //////
    for (let i = 0; i < this.sourceUse.length; i++) {
      const source = this.sourceUse[i];
      engine.render(source);
    }
    /////////////////////

    if (this.afterPassExecute !== undefined) {
      this.afterPassExecute();
    }

    engine.overrideTechnique = null;
    engine.renderer.state.colorbuffer.resetDefaultClearColor();


    if (this.graph.enableDebuggingView && !this.isOutputScreen) {
      this.renderDebugResult(engine);
    }

  }

  checkIsValid() {
    if (this.isOutputScreen) {
      return
    }
    const target = this.outputTarget.name;
    this.inputTarget.forEach(input => {
      if (input === target) {
        throw 'not valid'
      }
    })
  }
}