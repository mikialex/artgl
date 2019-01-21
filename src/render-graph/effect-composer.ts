import { RenderPass } from "./pass";
import { ARTEngine, RenderSource } from "../engine/render-engine";
import { RenderGraph } from "./render-graph";
import { DAGNode } from "./dag/dag-node";
import { PassGraphNode } from "./dag/pass-graph-node";

export class EffectComposer{
  constructor(graph: RenderGraph) {
    this.graph = graph;
    this.engine = graph.engine;
  }

  private graph: RenderGraph;
  private engine: ARTEngine;
  private passes: RenderPass[] = [];
  private nodeQueue: DAGNode[];

  updatePasses(nodeQueue: DAGNode[]) {
    this.nodeQueue = nodeQueue;
    nodeQueue.forEach(node => {
      if (node instanceof PassGraphNode) {
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