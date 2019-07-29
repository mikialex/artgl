import { PassDefine, GraphDefine, RenderTargetDefine } from "./interface";
import { PassGraphNode } from "./node/pass-graph-node";
import { RenderTargetNode } from "./node/render-target-node";
import { RenderEngine } from "../engine/render-engine";
import { QuadSource } from './quad-source';
import { Vector4 } from "../math/vector4";
import { RenderPass } from "./pass";


export type RenderGraphNode = PassGraphNode | RenderTargetNode;

export class EffectComposer {

  private passes: RenderPass[] = [];
  private nodeMap: Map<PassGraphNode, RenderPass> = new Map();

  render(engine: RenderEngine, graph: RenderGraph) {
    this.passes.forEach(pass => {
      pass.execute(engine, graph);
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



export class RenderGraph {

  static screenRoot: string = 'artgl-rendergraph-screen-rt';
  static quadSource = new QuadSource();

  enableDebuggingView: boolean = false;

  screenNode: RenderTargetNode;
  renderTargetNodes: Map<string, RenderTargetNode> = new Map();
  passNodes: Map<string, PassGraphNode> = new Map();

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

  /**
   * Clear the graph pass info as needed
   *
   * @memberof RenderGraph
   */
  reset() {
    this.renderTargetNodes.clear();
    this.passNodes.clear();
  }

  /**
   * Setup a new Graph configuration
   *
   * @param {GraphDefine} graphDefine
   * @memberof RenderGraph
   */
  defineGraph(composer: EffectComposer, graphDefine: GraphDefine): void {
    this.reset();
    this.allocateRenderTargetNodes(graphDefine.renderTargets);
    this.constructPassGraph(graphDefine.passes, composer);
  }

  /**
   * Update the pass queue from current graph configure
   *
   * @memberof RenderGraph
   */
  update(engine: RenderEngine, composer: EffectComposer) {
    
    //updateNodesConnection
    this.passNodes.forEach(node => {
      node.updateDependNode(this);
    });
    this.renderTargetNodes.forEach(node => {
      node.updateDependNode(this);
    });

    // update pass queue
    const nodeQueue = this.screenNode.generateDependencyOrderList() as RenderGraphNode[];
    composer.reset();
    nodeQueue.forEach(node => {
      if (node instanceof RenderTargetNode) {
        node.updateSize(engine);
      }
    })
    nodeQueue.forEach(node => {
      if (node instanceof PassGraphNode) {
        const pass = composer.getPass(node);
        if (pass === undefined) {
          throw "err" // TODO
        }
        node.updatePass(engine, pass, nodeQueue);
        composer.addPass(pass);
      }
    })
  }

  private constructPassGraph(passesDefine: PassDefine[], composer: EffectComposer) {
    passesDefine.forEach(define => {
      if (!this.passNodes.has(define.name)) {
        const node = new PassGraphNode(this, define);
        this.passNodes.set(define.name, node);
        composer.registerNode(node, define);
      } else {
        throw 'duplicate pass define found'
      }
    })
  }

  getRenderTargetDependence(name: string): RenderTargetNode {
    return this.renderTargetNodes.get(name);
  }

  getRenderPassDependence(name: string): PassGraphNode {
    return this.passNodes.get(name);
  }

  getRootScreenTargetNode() {
    let screenNode;
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
      const renderTargetNode = new RenderTargetNode(define);
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

  updateRenderTargetDebugView(engine: RenderEngine, nodeId: string, viewPort: Vector4) {
    if (this.screenNode.uuid === nodeId) {
      RenderPass.screenDebugViewPort.copy(viewPort);
      return
    }

    this.renderTargetNodes.forEach(node => {
      if (node.uuid === nodeId) {
        node.debugViewPort.copy(viewPort);
      }
    })
  }

}