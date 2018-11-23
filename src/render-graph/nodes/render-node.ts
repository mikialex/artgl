import { RenderGraphNode } from "../render-graph-node";
import { RenderGraph } from "../render-graph";
import { ARTEngine } from "../../engine/render-engine";
import { RenderList } from "../../engine/render-list";

export class RenderNode extends RenderGraphNode {
  constructor(keyName: string, graph: RenderGraph) {
    super(keyName, graph);
  }

  engine: ARTEngine;
  
  private pipeInput: RenderList;
  pipe(renderlist: RenderList) {
    this.pipeInput = renderlist;
  }

  getRenderList() {
    if (this.pipeInput && this.dependency.length > 0) {
      throw 'rendernode only support one source, use merge node to merge renderlist'
    }
  }

  setEngine(engine: ARTEngine) {
    this.engine = engine;
  }

  render() {
    if (this.engine === undefined) {
      throw 'engine not set'
    }
    // todo check frameoutput whether exist

    // todo render
  }
}