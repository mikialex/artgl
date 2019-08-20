import { PassGraphNode, RenderGraph } from "../artgl";
import { FrameBufferPool } from "./framebuffer-pool";
import { RenderPass } from "./pass";
import { RenderTargetNode } from "./node/render-target-node";
import { RenderGraphBackendAdaptor, NamedAndFormatKeyed } from "./backend-interface";

/**
 * Responsible for rendergraph execution and optimization
 */
export class EffectComposer<RenderableType, FBOType extends NamedAndFormatKeyed> {
  constructor(engine: RenderGraphBackendAdaptor<RenderableType, FBOType>) {
    this.engine = engine;
    this.framebufferPool = new FrameBufferPool(this.engine);

    this.engine.resizeObservable.add(() => {
      this.keptFramebuffer.clear();
    })
  }

  private engine: RenderGraphBackendAdaptor<RenderableType, FBOType>;
  private passes: RenderPass<RenderableType, FBOType>[] = [];

  private nodeMap: Map<PassGraphNode<RenderableType, FBOType>, RenderPass<RenderableType, FBOType>> = new Map();
  private framebufferPool: FrameBufferPool<RenderableType, FBOType>;

  private keptFramebuffer: Map<RenderTargetNode<RenderableType, FBOType>, FBOType> = new Map();
  private framebufferDropList: RenderTargetNode<RenderableType, FBOType>[][] = [];

  getFramebuffer(node: RenderTargetNode<RenderableType, FBOType>) {
    return this.keptFramebuffer.get(node)
  }

  render(
    engine: RenderGraphBackendAdaptor<RenderableType, FBOType>,
    graph: RenderGraph<RenderableType, FBOType>
  ) {
    this.passes.forEach((pass, index) => {
      const output = pass.outputTarget;
      let framebuffer: FBOType = this.keptFramebuffer.get(output)

      if (framebuffer === undefined) {
        framebuffer = this.framebufferPool.requestFramebuffer(output)
      }

      pass.uniformRenderTargetNodeMap.forEach((targetDepend, uniformName) => {
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

  setPasses(passes: RenderPass<RenderableType, FBOType>[]) {
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
        if (passMaybeUsed.framebuffersDepends.has(targetCreated)) {
          this.framebufferDropList[i].push(targetCreated)
          return;
        }
      }
    })

  }

  registerNode(node: PassGraphNode<RenderableType, FBOType>) {
    if (this.nodeMap.has(node)) {
      return this.nodeMap.get(node);
    }
    const pass = new RenderPass<RenderableType, FBOType>(node.define)
    this.nodeMap.set(node, pass);
    return pass;
  }

  clear() {
    this.passes = [];
    this.nodeMap.clear();
    this.framebufferDropList = [];
    this.keptFramebuffer.clear();
  }

  getPass(node: PassGraphNode<RenderableType, FBOType>)
    : RenderPass<RenderableType, FBOType> {
    return this.nodeMap.get(node);
  }

}