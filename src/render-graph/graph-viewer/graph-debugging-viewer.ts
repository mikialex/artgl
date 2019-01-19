import { RenderGraph } from "../render-graph";
import { RenderPass } from "../pass";


export class GraphDebuggingViewer{
  constructor(graph: RenderGraph) {
    this.graph = graph;
  }
  graph: RenderGraph;
  rootOffsetX: number = 0;
  rootOffsetY: number = 0;

  shouldDrawPassDebug(pass: RenderPass) {
    
  }

  updatePassDebugViewport(pass: RenderPass) {
    
  }

}