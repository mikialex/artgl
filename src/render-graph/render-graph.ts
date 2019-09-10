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

  setScreenRoot(node: RenderTargetNode) {
    this.screenNode = node;
  }

  reset() {
    this.screenNode = null;
  }

  /**
   * build the pass queue from current graph structure
   */
  build(engine: RenderEngine, composer: EffectComposer) {

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

}