import { RenderGraph } from "./render-graph";
import { Nullable } from "../type";
import { RenderTargetNode } from "./node/render-target-node";
import { PassGraphNode } from "./node/pass-graph-node";
import { Vector4Like } from "../math/interface";
import { Vector4 } from "../math";
import { Shading } from "../artgl";
import { RenderEngine } from "../engine/render-engine";
import { GLFramebuffer } from "../webgl/gl-framebuffer";

export type uniformName = string;
type framebufferName = string;

export class RenderPass {
  constructor(passNode: PassGraphNode, outputNode: RenderTargetNode) {
    this.passNode = passNode;
    this.outputTarget = outputNode;
    passNode.updatePass(this);
  }
  passNode: PassGraphNode;

  private beforeClearColor: Vector4Like = new Vector4(1, 1, 1, 1);

  uniformNameFBOMap: Map<uniformName, framebufferName> = new Map();
  uniformRenderTargetNodeMap: Map<uniformName, RenderTargetNode> = new Map();
  framebuffersDepends: Set<RenderTargetNode> = new Set();

  // outputInfos
  outputTarget: RenderTargetNode;

  get isOutputScreen() {
    return this.outputTarget.isScreenNode;
  }

  renderDebugResult(
    engine: RenderEngine,
    framebuffer: GLFramebuffer
  ) {
    const debugOutputViewport = this.outputTarget.debugViewPort;
    engine.renderFrameBuffer(framebuffer, debugOutputViewport)
    // this will cause no use draw TODO optimize
    this.uniformNameFBOMap.forEach((inputFramebufferName, uniformName) => {
      const dependFramebuffer = engine.getFramebuffer(inputFramebufferName)!;
      const debugInputViewport = this.uniformRenderTargetNodeMap.get(uniformName)!.debugViewPort;
      engine.renderFrameBuffer(dependFramebuffer, debugInputViewport)
    })
  }

  execute(
    engine: RenderEngine,
    framebuffer: Nullable<GLFramebuffer>,
    enableDebuggingView: boolean = false,
  ) {

    let outputTarget: GLFramebuffer;

    // setup viewport and render target
    if (this.isOutputScreen) {
      engine.setRenderTargetScreen();
      if (enableDebuggingView) {
        const debugViewPort = this.outputTarget.debugViewPort;
        engine.setViewport(
          debugViewPort.x, debugViewPort.y,
          debugViewPort.z, debugViewPort.w
        );

      } else {
        engine.setFullScreenViewPort();
      }
    } else {
      outputTarget = framebuffer!;
      engine.setRenderTarget(outputTarget);
      engine.setViewport(0, 0, this.outputTarget.widthAbs, this.outputTarget.heightAbs);
    }

    // input binding 
    const overrideShading = this.passNode._overrideShading;
    if (overrideShading !== null) {
      engine.setOverrideShading(overrideShading);
      this.uniformNameFBOMap.forEach((inputFramebufferName, uniformName) => {
        overrideShading.defineFBOInput(
          inputFramebufferName, uniformName
        );
      })
    }


    engine.getClearColor(this.beforeClearColor);
    // clear setting
    if (this.passNode._enableColorClear) {
      engine.setClearColor(this.passNode._clearColor);
      engine.clearColor();
    }
    if (this.passNode._enableDepthClear) {
      if (!this.isOutputScreen && this.outputTarget.enableDepth) {
        engine.clearDepth();
      }
    }

    this.passNode.beforePassExecute.notifyObservers(this.passNode);

    //////  render //////
    this.passNode.source.forEach(source => {
      source(engine);
    })
    /////////////////////
    
    this.passNode.afterPassExecute.notifyObservers(this.passNode);

    engine.setOverrideShading(null);
    engine.setClearColor(this.beforeClearColor);


    if (enableDebuggingView && !this.isOutputScreen) {
      this.renderDebugResult(engine, framebuffer!);
    }

  }

  checkIsValid() {
    if (this.isOutputScreen) {
      return
    }
    const target = this.outputTarget.name;
    this.uniformNameFBOMap.forEach(input => {
      if (input === target) {
        throw `you cant output to the render target which is depend on: 
Duplicate target: ${this.outputTarget.name};`
      }
    })
  }
}