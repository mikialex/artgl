import { GLFramebuffer } from "../webgl/gl-framebuffer";
import { RenderEngine } from "../engine/render-engine";
import { RenderGraph } from "./render-graph";
import { PassDefine, PassInputMapInfo } from "./interface";
import { RenderTargetNode } from "./node/render-target-node";
import { Vector4 } from "../math/vector4";
import { Nullable } from "../type";
import { Shading } from "../core/shading";

export class RenderPass{
  constructor(define: PassDefine) {
    this.define = define;
    this.name = define.name;
    if (define.shading !== undefined) {
      const overrideShading = define.shading;
      if (overrideShading === undefined) {
        throw `technique '${define.shading}' not defined`
      }
      this.overrideShading = overrideShading;
    }

    this.clearColor = define.clearColor;
    this.enableColorClear = define.enableColorClear === undefined ? true : define.enableColorClear
    this.enableDepthClear = define.enableDepthClear === undefined ? true : define.enableDepthClear

    this.beforePassExecute = define.beforePassExecute;
    this.afterPassExecute = define.afterPassExecute;

  }

  updateInputTargets(inputs: PassInputMapInfo) {
    this.inputTarget.clear();
    Object.keys(inputs).forEach(inputKey => {
      const mapTo = inputs[inputKey];
      this.inputTarget.set(inputKey, mapTo)
    })
  }

  readonly define: PassDefine;
  public name: string;

  private clearColor: Vector4;
  private enableDepthClear: boolean = true;
  private enableColorClear: boolean = true;

  private afterPassExecute?: () => any;
  private beforePassExecute?: () => any;
  
  private overrideShading: Nullable<Shading> = null;

  // key: uniformName ;   value: inputFramebufferName
  private inputTarget: Map<string, string> = new Map();
  private outputTarget: GLFramebuffer


  setOutPutTarget(engine: RenderEngine, renderTargetNode: RenderTargetNode) {
    if (renderTargetNode.name === RenderGraph.screenRoot) {
      this.outputTarget = undefined;
      this.isOutputScreen = true;
    } else {
      this.outputTarget = renderTargetNode.getOrCreateFrameBuffer(engine);
      this.isOutputScreen = false;
    }
  }
  private isOutputScreen: boolean = true;

  renderDebugResult(engine: RenderEngine, graph: RenderGraph) {
    const debugOutputViewport = graph.renderTargetNodes.get(this.outputTarget.name).debugViewPort;
    engine.renderFrameBuffer(this.outputTarget, debugOutputViewport)
    // this will cause no use draw TODO optimize
    this.inputTarget.forEach((inputFramebufferName, _uniformName) => {
      const framebuffer = engine.renderer.framebufferManager.getFramebuffer(inputFramebufferName);
      const debugInputViewport = graph.renderTargetNodes.get(framebuffer.name).debugViewPort;
      engine.renderFrameBuffer(framebuffer, debugInputViewport)
    })
  } 

  execute(engine: RenderEngine, graph: RenderGraph) {

    // setup viewport and render target
    if (this.isOutputScreen) {
      engine.renderer.setRenderTargetScreen();
      if (graph.enableDebuggingView) {
        const debugViewPort = graph.screenNode.debugViewPort;
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
  
    // input binding 
    if (this.overrideShading !== null) {
      engine.overrideShading = this.overrideShading;
      this.inputTarget.forEach((inputFramebufferName, uniformName) => {
        (engine.overrideShading as Shading).getProgram(engine).defineFrameBufferTextureDep(
          inputFramebufferName, uniformName
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
    this.define.source.forEach(source => {
      engine.render(source);
    })
    /////////////////////

    if (this.afterPassExecute !== undefined) {
      this.afterPassExecute();
    }

    engine.overrideShading = null;
    engine.renderer.state.colorbuffer.resetDefaultClearColor();


    if (graph.enableDebuggingView && !this.isOutputScreen) {
      this.renderDebugResult(engine, graph);
    }

  }

  checkIsValid() {
    if (this.isOutputScreen) {
      return
    }
    const target = this.outputTarget.name;
    this.inputTarget.forEach(input => {
      if (input === target) {
        throw `you cant output to the render target which is depend on: 
Duplicate target: ${this.outputTarget.name};`
      }
    })
  }
}