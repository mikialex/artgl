import { PassDefine, GraphDefine, RenderTargetDefine } from "./interface";
import { PassGraphNode } from "./node/pass-graph-node";
import { RenderTargetNode } from "./node/render-target-node";
import { QuadSource } from '../engine/render-source';
import { EffectComposer } from "./effect-composer";
import { RenderPass } from "./pass";
import { Nullable } from "../type";
import { RenderEngine } from "../engine/render-engine";

export type RenderGraphNode = PassGraphNode | RenderTargetNode;

export class RenderGraph {

  static screenRoot: string = 'artgl-rendergraph-screen-rt';
  static quadSource = new QuadSource();

  enableDebuggingView: boolean = false;

  screenNode: Nullable<RenderTargetNode> = null;
  renderTargetNodes: Map<string, RenderTargetNode> = new Map();
  passNodes: Map<string, PassGraphNode> = new Map();

  get nodes() {
    const nodes: RenderGraphNode[] = [];
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
  update(engine: RenderEngine, composer: EffectComposer) {

    //updateNodesConnection
    this.passNodes.forEach(node => {
      node.updateDependNode(this);
    });
    this.renderTargetNodes.forEach(node => {
      node.updateDependNode(this);
    });

    // create and update pass queue
    const nodeQueue = this.screenNode!.getTopologicalSortedList() as
      RenderGraphNode[];
    const passes: RenderPass[] = [];
    nodeQueue.forEach(node => {
      if (node instanceof PassGraphNode) {
        const pass = composer.registerNode(node);
        node.updatePass(pass);
        passes.push(pass);
      } else if (node instanceof RenderTargetNode) {
        if (node.fromPassNode !== null) {
          const pass = composer.getPass(node.fromPassNode)!;
          node.updatePass(engine, pass)
        }
      }
    })
    composer.setPasses(passes)
  }

  private constructPassGraph(passesDefine: PassDefine[]) {
    passesDefine.forEach(define => {
      if (!this.passNodes.has(define.name)) {
        const node = new PassGraphNode(define);
        this.passNodes.set(define.name, node);
      } else {
        throw 'duplicate pass define found'
      }
    })
  }

  getRenderTargetDependence(name: string) {
    return this.renderTargetNodes.get(name);
  }

  getRenderPassDependence(name: string) {
    return this.passNodes.get(name);
  }

  getRootScreenTargetNode() {
    return this.screenNode;
  }

  private allocateRenderTargetNodes(textsDefine: RenderTargetDefine[]) {
    textsDefine.forEach(define => {
      if (this.renderTargetNodes.has(define.name)) {
        throw 'render graph build error, duplicate texture key name found '
      }
      const renderTargetNode = new RenderTargetNode(define);
      if (define.name === RenderGraph.screenRoot) {
        this.screenNode = renderTargetNode
      }
      this.renderTargetNodes.set(define.name, renderTargetNode);
    })

    if (this.screenNode === null) {
      throw "screen root not found"
    }
  }

}