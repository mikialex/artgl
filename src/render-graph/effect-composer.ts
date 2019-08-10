import { RenderEngine, PassGraphNode, RenderGraph } from "../artgl";
import { FrameBufferPool } from "./framebuffer-pool";
import { RenderPass } from "./pass";
import { PassDefine } from "./interface";
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
      let framebuffer: GLFramebuffer = this.keptFramebuffer.get(pass.outputTarget)

      if (framebuffer === undefined) {
          framebuffer = this.framebufferPool.requestFramebuffer(pass.outputTarget)
      }

      pass.execute(engine, graph, framebuffer);

      this.framebufferDropList[index].forEach(target => {
        this.framebufferPool.returnFramebuffer(this.keptFramebuffer.get(target))
      })

    });
  }

  setPasses(passes: RenderPass[]) {
    this.passes = passes;

    // compute dropList
    this.framebufferDropList = new Array(this.passes.length).fill([]);
    passes.forEach((pass, index) => {
      const targetCreated = pass.outputTarget;
      if (targetCreated.define.keepContent()) {
        return 
      }
      for (let i = passes.length - 1; i > index; i--) {
        const passMaybeUsed = passes[i];
        if (passMaybeUsed.framebuffersDepends.has(targetCreated.name)) {
          this.framebufferDropList[i].push(targetCreated)
        }
      }
    })

  }

  registerNode(node: PassGraphNode, define: PassDefine ) {
    const pass = new RenderPass(define)
    this.nodeMap.set(node, pass);
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