import { PassDefine, GraphDefine, RenderTargetDefine } from "./interface";
import { PassGraphNode } from "./node/pass-graph-node";
import { RenderTargetNode } from "./node/render-target-node";
import { QuadSource } from '../engine/render-source';
import { EffectComposer } from "./effect-composer";
import { RenderGraphBackendAdaptor, NamedAndFormatKeyed, ShadingConstrain, ShadingDetermined } from "./backend-interface";

export type RenderGraphNode
  <
  ShadingType extends ShadingConstrain,
  RenderableType extends ShadingDetermined<ShadingType>,
  FBOType extends NamedAndFormatKeyed
  >
  =
  PassGraphNode<ShadingType, RenderableType, FBOType>
  | RenderTargetNode<ShadingType, RenderableType, FBOType>;

export class RenderGraph<
  ShadingType extends ShadingConstrain,
  RenderableType extends ShadingDetermined<ShadingType>,
  FBOType extends NamedAndFormatKeyed
  > {

  static screenRoot: string = 'artgl-rendergraph-screen-rt';
  static quadSource = new QuadSource();

  enableDebuggingView: boolean = false;

  screenNode: RenderTargetNode<ShadingType, RenderableType, FBOType>;
  renderTargetNodes: Map<string, RenderTargetNode<ShadingType, RenderableType, FBOType>> = new Map();
  passNodes: Map<string, PassGraphNode<ShadingType, RenderableType, FBOType>> = new Map();

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
  defineGraph(graphDefine: GraphDefine<ShadingType>): void {
    this.reset();
    this.allocateRenderTargetNodes(graphDefine.renderTargets);
    this.constructPassGraph(graphDefine.passes);
  }

  /**
   * Update the pass queue from current graph configure
   */
  update(
    engine: RenderGraphBackendAdaptor<ShadingType, RenderableType, FBOType>,
    composer: EffectComposer<ShadingType, RenderableType, FBOType>
  ) {

    //updateNodesConnection
    this.passNodes.forEach(node => {
      node.updateDependNode(this);
    });
    this.renderTargetNodes.forEach(node => {
      node.updateDependNode(this);
    });

    // create and update pass queue
    const nodeQueue = this.screenNode.getTopologicalSortedList() as
      RenderGraphNode<ShadingType, RenderableType, FBOType>[];
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

  private constructPassGraph(passesDefine: PassDefine<ShadingType>[]) {
    passesDefine.forEach(define => {
      if (!this.passNodes.has(define.name)) {
        const node = new PassGraphNode<ShadingType, RenderableType, FBOType>(define);
        this.passNodes.set(define.name, node);
      } else {
        throw 'duplicate pass define found'
      }
    })
  }

  getRenderTargetDependence(name: string): RenderTargetNode<ShadingType, RenderableType, FBOType> {
    return this.renderTargetNodes.get(name);
  }

  getRenderPassDependence(name: string): PassGraphNode<ShadingType, RenderableType, FBOType> {
    return this.passNodes.get(name);
  }

  getRootScreenTargetNode() {
    let screenNode: RenderTargetNode<ShadingType, RenderableType, FBOType>;
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
      const renderTargetNode = new RenderTargetNode<ShadingType, RenderableType, FBOType>(define);
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