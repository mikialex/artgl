import { PassGraphNode, RenderGraph } from "../artgl";
import { FrameBufferPool } from "./framebuffer-pool";
import { RenderPass } from "./pass";
import { RenderTargetNode } from "./node/render-target-node";
import { RenderGraphBackendAdaptor, NamedAndFormatKeyed, ShadingDetermined, ShadingConstrain } from "./backend-interface";

/**
 * Responsible for rendergraph execution and optimization
 */
export class EffectComposer
  <ShadingType extends ShadingConstrain,
  RenderableType extends ShadingDetermined<ShadingType>,
  FBOType extends NamedAndFormatKeyed>
{
  constructor(engine: RenderGraphBackendAdaptor<ShadingType, RenderableType, FBOType>) {
    this.engine = engine;
    this.framebufferPool = new FrameBufferPool(this.engine);

    this.engine.resizeObservable.add(() => {
      this.keptFramebuffer.clear();
    })
  }

  private engine: RenderGraphBackendAdaptor<ShadingType, RenderableType, FBOType>;
  private passes: RenderPass<ShadingType, RenderableType, FBOType>[] = [];

  private nodeMap: Map<
    PassGraphNode<ShadingType, RenderableType, FBOType>,
    RenderPass<ShadingType, RenderableType, FBOType>
    > = new Map();
  
  private framebufferPool: FrameBufferPool<ShadingType, RenderableType, FBOType>;

  private keptFramebuffer: Map<RenderTargetNode<ShadingType, RenderableType, FBOType>, FBOType> = new Map();
  private framebufferDropList: RenderTargetNode<ShadingType, RenderableType, FBOType>[][] = [];

  getFramebuffer(node: RenderTargetNode<ShadingType, RenderableType, FBOType>) {
    return this.keptFramebuffer.get(node)
  }

  render(
    engine: RenderGraphBackendAdaptor<ShadingType, RenderableType, FBOType>,
    graph: RenderGraph<ShadingType, RenderableType, FBOType>
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

  setPasses(passes: RenderPass<ShadingType, RenderableType, FBOType>[]) {
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

  registerNode(node: PassGraphNode<ShadingType, RenderableType, FBOType>) {
    if (this.nodeMap.has(node)) {
      return this.nodeMap.get(node);
    }
    const pass = new RenderPass<ShadingType, RenderableType, FBOType>(node.define)
    this.nodeMap.set(node, pass);
    return pass;
  }

  clear() {
    this.passes = [];
    this.nodeMap.clear();
    this.framebufferDropList = [];
    this.keptFramebuffer.clear();
  }

  getPass(node: PassGraphNode<ShadingType, RenderableType, FBOType>)
    : RenderPass<ShadingType, RenderableType, FBOType> {
    return this.nodeMap.get(node);
  }

}