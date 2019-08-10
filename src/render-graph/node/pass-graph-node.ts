import { DAGNode } from "../../core/dag-node";
import { PassDefine, PassInputMapInfo } from "../interface";
import { RenderGraph } from "../render-graph";
import { RenderPass } from "../pass";
import { Nullable } from "../../type";

export class PassGraphNode extends DAGNode {
  constructor(define: PassDefine) {
    super();
    this.name = define.name;

    if (define.inputs !== undefined) {
      this.inputsGetter = define.inputs;
    }

  }
  private inputsGetter: Nullable<() => PassInputMapInfo> = null
  inputs: PassInputMapInfo = {}
  readonly name: string;

  // update graph structure
  updateDependNode(graph: RenderGraph) {
    // disconnect all depends node 
    this.clearAllFrom();

    // reval getter
    if (this.inputsGetter !== null) {
      this.inputs = this.inputsGetter();
    }
    const inputs = this.inputs;
    // connect new depends node
    Object.keys(inputs).forEach(inputUniformKey => {
      const framebufferName = inputs[inputUniformKey]
      const renderTargetNode = graph.getRenderTargetDependence(framebufferName);
      if (renderTargetNode === undefined) {
        throw `render graph updating error, renderTarget depend node ${framebufferName} cant found`;
      }
      renderTargetNode.connectTo(this);
    })
  }

  // from updated graph structure, setup render pass
  updatePass(pass: RenderPass) {
    pass.uniformNameFBOMap.clear();
    pass.framebuffersDepends.clear();
    Object.keys(this.inputs).forEach(inputKey => {
      const mapTo = this.inputs[inputKey];
      pass.uniformNameFBOMap.set(inputKey, mapTo)
      pass.framebuffersDepends.add(mapTo)
    })
    pass.passNode = this;
  }

}