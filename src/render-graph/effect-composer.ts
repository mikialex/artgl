import { RenderPass } from "./pass";
import { ARTEngine, RenderSource } from "../engine/render-engine";
import { RenderGraph } from "./render-graph";
import { PassGraphNode } from "./dag/pass-graph-node";
import { RenderTargetNode } from "./dag/render-target-node";

export type RenderGraphNode = PassGraphNode | RenderTargetNode;

export class EffectComposer{
  constructor(graph: RenderGraph) {
    this.graph = graph;
    this.engine = graph.engine;
  }

  private graph: RenderGraph;
  private engine: ARTEngine;
  private passes: RenderPass[] = [];

  updatePasses(nodeQueue: RenderGraphNode[]) {
    this.clearPasses();
    nodeQueue.forEach(node => {
      if (node instanceof PassGraphNode) {
        node.updatePass(nodeQueue);
        this.passes.push(node.pass);
      }
    })
  }

  clearPasses() {
    this.passes = [];
  }

  render() {
    this.passes.forEach(pass => {
      pass.execute();
    });
  }
}