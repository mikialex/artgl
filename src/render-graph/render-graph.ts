import { PassDefine, GraphDefine, RenderTargetDefine } from "./interface";
import { PassGraphNode } from "./node/pass-graph-node";
import { RenderTargetNode } from "./node/render-target-node";
import { QuadSource } from '../engine/quad-source';
import { EffectComposer } from "./effect-composer";
import { RenderGraphBackendAdaptor, NamedAndFormatKeyed } from "./backend-interface";

export type RenderGraphNode<RenderableType, FBOType extends NamedAndFormatKeyed> =
  PassGraphNode<RenderableType, FBOType> | RenderTargetNode<RenderableType, FBOType>;

export class RenderGraph<RenderableType, FBOType extends NamedAndFormatKeyed> {

  static screenRoot: string = 'artgl-rendergraph-screen-rt';
  static quadSource = new QuadSource();

  enableDebuggingView: boolean = false;

  screenNode: RenderTargetNode<RenderableType, FBOType>;
  renderTargetNodes: Map<string, RenderTargetNode<RenderableType, FBOType>> = new Map();
  passNodes: Map<string, PassGraphNode<RenderableType, FBOType>> = new Map();

  get nodes() {
    const nodes = [];
    this.passNodes.forEach(node => {
      nodes.push(node);
    })
    this.renderTargetNodes.forEach(node => {
      nodes.push(node);
    })
    return nodes;
  }

  reset() {
    this.renderTargetNodes.clear();
    this.passNodes.clear();
  }

  /**
   * Setup a new Graph configuration
   */
  defineGraph(graphDefine: GraphDefine): void {
    this.reset();
    this.allocateRenderTargetNodes(graphDefine.renderTargets);
    this.constructPassGraph(graphDefine.passes);
  }

  /**
   * Update the pass queue from current graph configure
   */
  update(
    engine: RenderGraphBackendAdaptor<RenderableType, FBOType>,
    composer: EffectComposer<RenderableType, FBOType>
  ) {
    
    //updateNodesConnection
    this.passNodes.forEach(node => {
      node.updateDependNode(this);
    });
    this.renderTargetNodes.forEach(node => {
      node.updateDependNode(this);
    });

    // create and update pass queue
    const nodeQueue = this.screenNode.getTopologicalSortedList() as RenderGraphNode<RenderableType, FBOType>[];
    const passes = [];
    nodeQueue.forEach(node => {
      if (node instanceof PassGraphNode) {
        const pass = composer.registerNode(node);
        node.updatePass(pass);
        passes.push(pass);
      } else if (node instanceof RenderTargetNode) {
        if (node.fromPassNode !== null) {
          const pass = composer.getPass(node.fromPassNode);
          node.updatePass(engine, pass)
        }
      }
    })
    composer.setPasses(passes)
  }

  private constructPassGraph(passesDefine: PassDefine[]) {
    passesDefine.forEach(define => {
      if (!this.passNodes.has(define.name)) {
        const node = new PassGraphNode<RenderableType, FBOType>(define);
        this.passNodes.set(define.name, node);
      } else {
        throw 'duplicate pass define found'
      }
    })
  }

  getRenderTargetDependence(name: string): RenderTargetNode<RenderableType, FBOType> {
    return this.renderTargetNodes.get(name);
  }

  getRenderPassDependence(name: string): PassGraphNode<RenderableType, FBOType> {
    return this.passNodes.get(name);
  }

  getRootScreenTargetNode() {
    let screenNode: RenderTargetNode<RenderableType, FBOType>;
    this.renderTargetNodes.forEach(node => {
      if (node.isScreenNode) {
        screenNode = node;
      }
    })
    return screenNode;
  }

  private allocateRenderTargetNodes(textsDefine: RenderTargetDefine[]) {
    textsDefine.forEach(define => {
      if (this.renderTargetNodes.has(define.name)) {
        throw 'render graph build error, duplicate texture key name found '
      }
      const renderTargetNode = new RenderTargetNode<RenderableType, FBOType>(define);
      if (define.name === RenderGraph.screenRoot) {
        if (this.screenNode !== undefined) {
          throw "duplicate screen root node"
        }
        this.screenNode = renderTargetNode
      }
      this.renderTargetNodes.set(define.name, renderTargetNode);
    })

    if (this.screenNode === undefined) {
      throw "screen root not found"
    }
  }

}