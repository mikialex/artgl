import { RenderPass } from "./pass";
import { ARTEngine } from "../engine/render-engine";
import { RenderGraph } from "./render-graph";
import { DAGNode } from "./dag/dag-node";

export class EffectComposer{
  constructor(graph: RenderGraph) {
    this.graph = graph;
    this.engine = graph.engine;
  }

  private graph: RenderGraph;
  private engine: ARTEngine;
  private passes: RenderPass[];

  updatePasses(nodeQueue: DAGNode[]) {
    
  }


  clearPasses() {
    this.passes = [];
  }

  render() {
    this.passes.forEach(pass => {
      pass.execute(this.engine);
    });
  }
}