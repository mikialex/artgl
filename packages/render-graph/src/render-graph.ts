import { PassGraphNode } from "./node/pass-graph-node";
import { RenderTargetNode } from "./node/render-target-node";
import { EffectComposer } from "./effect-composer";
import { RenderPass } from "./pass";
import { Nullable } from "@artgl/shared";

export type RenderGraphNode = PassGraphNode | RenderTargetNode;

export class RenderGraph {

  static screenRoot: string = 'artgl-rendergraph-screen-rt';

  screenNode: Nullable<RenderTargetNode> = null;
  _nodesCache: RenderGraphNode[] = [];

  get nodes() {
    return this._nodesCache;
  }

  setScreenRoot(node: RenderTargetNode) {
    this.screenNode = node;
  }

  reset() {
    this.screenNode = null;
  }

  /**
   * build the pass queue from current graph structure
   */
  build(composer: EffectComposer) {
    if (this.screenNode === null) {
      throw "render graph is not ready, screen root node is not set"
    }

    // create and update pass queue
    const nodeQueue = this.screenNode.getTopologicalSortedList() as RenderGraphNode[];
    this._nodesCache = nodeQueue;
    const passes: RenderPass[] = [];

    nodeQueue.forEach(node => {
      if (node instanceof RenderTargetNode) {
        if (node.fromPassNode !== null) {
          const pass = new RenderPass(node.fromPassNode, node);
          passes.push(pass);
        }
      }
    })
    composer.setPasses(passes)
  }

}