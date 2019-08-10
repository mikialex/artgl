import { RenderEngine, PassGraphNode, RenderGraph } from "../artgl";
import { FrameBufferPool } from "./framebuffer-pool";
import { RenderPass } from "./pass";
import { RenderTargetNode } from "./node/render-target-node";
import { GLFramebuffer } from "../webgl/gl-framebuffer";

/**
 * Responsible for rendergraph execution and optimization
 */
export class EffectComposer {
  constructor(engine: RenderEngine) {
    this.engine = engine;
    this.framebufferPool = new FrameBufferPool(this.engine);
  }

  private engine: RenderEngine;
  private passes: RenderPass[] = [];

  private nodeMap: Map<PassGraphNode, RenderPass> = new Map();
  private framebufferPool: FrameBufferPool;

  private keptFramebuffer: Map<RenderTargetNode, GLFramebuffer> = new Map();
  private framebufferDropList: RenderTargetNode[][] = [];

  render(engine: RenderEngine, graph: RenderGraph) {
    this.passes.forEach((pass, index) => {
      const output = pass.outputTarget;
      let framebuffer: GLFramebuffer = this.keptFramebuffer.get(output)

      if (framebuffer === undefined) {
        framebuffer = this.framebufferPool.requestFramebuffer(output)
      }

      pass.uniformNameFBOMap.forEach((targetName, uniformName) => {
        const targetDepend = graph.getRenderTargetDependence(targetName);
        let inputFBO = this.keptFramebuffer.get(targetDepend);

        // if input not exist, its never initialized(empty fbo). created now!
        if (inputFBO === undefined) {
          targetDepend.updateSize(engine);
          inputFBO = this.framebufferPool.requestFramebuffer(targetDepend)
          this.keptFramebuffer.set(targetDepend, inputFBO);
        }

        pass.uniformNameFBOMap.set(uniformName, inputFBO.name)
      })
    
      pass.execute(engine, graph, framebuffer);

      this.keptFramebuffer.set(output, framebuffer);

      this.framebufferDropList[index].forEach(target => {
        this.framebufferPool.returnFramebuffer(this.keptFramebuffer.get(target))
        this.keptFramebuffer.delete(target)
      })

    });
  }

  setPasses(passes: RenderPass[]) {
    this.passes = passes;

    // compute dropList
    this.framebufferDropList = [];
    for (let i = 0; i < this.passes.length; i++) {
      this.framebufferDropList.push([])
    }

    passes.forEach((pass, index) => {
      this.nodeMap.set(pass.passNode, pass);

      const targetCreated = pass.outputTarget;
      if (targetCreated.isScreenNode) {
        return;
      }

      if (targetCreated.define.keepContent()) {
        return;
      }
      for (let i = passes.length - 1; i > index; i--) {
        const passMaybeUsed = passes[i];
        if (passMaybeUsed.framebuffersDepends.has(targetCreated.name)) {
          this.framebufferDropList[i].push(targetCreated)
          return;
        }
      }
    })

  }

  registerNode(node: PassGraphNode) {
    if (this.nodeMap.has(node)) {
      return this.nodeMap.get(node);
    }
    const pass = new RenderPass(node.define)
    this.nodeMap.set(node, pass);
    return pass;
  }

  clear() {
    this.passes = [];
    this.nodeMap.clear();
    this.framebufferDropList = [];
    this.keptFramebuffer.clear();
  }

  getPass(node: PassGraphNode): RenderPass {
    return this.nodeMap.get(node);
  }

}