import { RenderEngine, PassGraphNode, RenderGraph } from "../artgl";
import { FrameBufferPool } from "./framebuffer-pool";
import { RenderPass } from "./pass";
import { PassDefine } from "./interface";

export class EffectComposer {
  constructor(engine: RenderEngine) {
    this.engine = engine;
    this.framebufferPool = new FrameBufferPool(this.engine);
  }

  private engine: RenderEngine;
  private passes: RenderPass[] = [];
  private nodeMap: Map<PassGraphNode, RenderPass> = new Map();
  private framebufferPool: FrameBufferPool;

  render(engine: RenderEngine, graph: RenderGraph) {
    this.passes.forEach(pass => {
      pass.execute(engine, graph, this.framebufferPool);
    });
  }

  reset() {
    this.passes = [];
  }

  addPass(pass: RenderPass) {
    this.passes.push(pass);
  }

  registerNode(node: PassGraphNode, define: PassDefine ) {
    const pass = new RenderPass(define)
    this.nodeMap.set(node, pass);
  }

  clear() {
    this.passes = [];
    this.nodeMap.clear();
  }

  getPass(node: PassGraphNode): RenderPass {
    return this.nodeMap.get(node);
  }

}