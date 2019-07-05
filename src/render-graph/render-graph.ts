import { PassDefine, GraphDefine, RenderTargetDefine } from "./interface";
import { PassGraphNode } from "./node/pass-graph-node";
import { RenderTargetNode } from "./node/render-target-node";
import { ARTEngine } from "../engine/render-engine";
import { QuadSource } from './quad-source';
import { Vector4 } from "../math/vector4";
import { RenderPass } from "./pass";


export type RenderGraphNode = PassGraphNode | RenderTargetNode;

export class RenderGraph {

  static screenRoot: string = 'artgl-rendergraph-screen-rt';
  static quadSource = new QuadSource();

  constructor(engine: ARTEngine) {
    this.engine = engine;
  }
  engine: ARTEngine;

  private passes: RenderPass[] = [];

  enableDebuggingView: boolean = false;

  private screenNode: RenderTargetNode;
  renderTargetNodes: Map<string, RenderTargetNode> = new Map();
  passNodes: Map<string, PassGraphNode> = new Map();

  getNodeByID(id: string) {
    let n;
    this.renderTargetNodes.forEach(node => {
      if (node.uuid === id) {
        n = node;
      }
    })
    this.passNodes.forEach(node => {
      if (node.uuid === id) {
        n = node;
      }
    })
    return n;
  }

  /**
   * Render a frame by this graph
   *
   * @memberof RenderGraph
   */
  public render() {
    this.passes.forEach(pass => {
      pass.execute();
    });
  }

  /**
   * Clear the graph pass info as needed
   *
   * @memberof RenderGraph
   */
  public reset() {
    this.renderTargetNodes.clear();
    this.passNodes.clear();
    this.passes = [];
  }

  /**
   * Setup a new Graph configuration
   *
   * @param {GraphDefine} graphDefine
   * @memberof RenderGraph
   */
  public setGraph(graphDefine: GraphDefine): void {
    this.reset();
    this.allocateRenderTargetNodes(graphDefine.renderTargets);
    this.constructPassGraph(graphDefine.passes);
    this.update();
  }

  /**
   * Update the pass queue from current graph configure
   *
   * @memberof RenderGraph
   */
  update() {
    
    //updateNodesConnection
    this.passNodes.forEach(node => {
      node.updateDependNode();
    });
    this.renderTargetNodes.forEach(node => {
      node.updateDependNode();
    });

    // update pass queue
    const nodeQueue = this.screenNode.generateDependencyOrderList() as RenderGraphNode[];
    this.passes = [];
    nodeQueue.forEach(node => {
      if (node instanceof PassGraphNode) {
        node.updatePass(nodeQueue);
        this.passes.push(node.pass);
      }
    })
  }

  private constructPassGraph(passesDefine: PassDefine[]) {
    passesDefine.forEach(define => {
      if (!this.passNodes.has(define.name)) {
        this.passNodes.set(define.name, new PassGraphNode(this, define));
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
      const renderTargetNode = new RenderTargetNode(this, define);
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

  updateRenderTargetDebugView(nodeId: string, viewPort: Vector4) {
    if (this.screenNode.uuid === nodeId) {
      RenderPass.screenDebugViewPort.copy(viewPort);
      return
    }

    this.renderTargetNodes.forEach(node => {
      if (node.uuid === nodeId) {
        node.framebuffer.debuggingViewport.copy(viewPort);
      }
    })
  }

}