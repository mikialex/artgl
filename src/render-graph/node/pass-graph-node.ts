import { DAGNode } from "../../core/dag-node";
import { PassDefine, PassInputMapInfo } from "../interface";
import { RenderGraph } from "../render-graph";
import { RenderPass, uniformName } from "../pass";
import { Nullable } from "../../type";
import { RenderTargetNode } from "../exports";
import { NamedAndFormatKeyed, ShadingDetermined, ShadingConstrain } from "../backend-interface";

export class PassGraphNode
  <
  ShadingType extends ShadingConstrain,
  RenderableType extends ShadingDetermined<ShadingType>,
  FBOType extends NamedAndFormatKeyed
  >
  extends DAGNode {
  constructor(define: PassDefine<ShadingType>) {
    super();
    this.name = define.name;

    if (define.inputs !== undefined) {
      this.inputsGetter = define.inputs;
    }

    this.define = define;

  }
  private inputsGetter: Nullable<() => PassInputMapInfo> = null
  inputs: Map<uniformName, RenderTargetNode<ShadingType, RenderableType, FBOType>> = new Map();
  readonly name: string;
  readonly define: PassDefine<ShadingType>;

  // update graph structure
  updateDependNode(graph: RenderGraph<ShadingType, RenderableType, FBOType>) {
    // disconnect all depends node 
    this.clearAllFrom();
    this.inputs.clear();

    // reval getter
    if (this.inputsGetter !== null) {
      const inputs = this.inputsGetter();
      Object.keys(inputs).forEach(key => {
        const renderTargetNode = graph.getRenderTargetDependence(inputs[key]);
        if (renderTargetNode === undefined) {
          throw `render graph updating error, renderTarget depend node ${inputs[key]} cant found`;
        }
        this.inputs.set(key, renderTargetNode)
        renderTargetNode.connectTo(this);
      })
    }

  }

  // from updated graph structure, setup render pass
  updatePass(pass: RenderPass<ShadingType, RenderableType, FBOType>) {
    pass.uniformNameFBOMap.clear();
    pass.framebuffersDepends.clear();
    pass.uniformRenderTargetNodeMap.clear();
    this.inputs.forEach((targetNode, uniformName) => {
      pass.uniformRenderTargetNodeMap.set(uniformName, targetNode)
      pass.framebuffersDepends.add(targetNode)
    })
    pass.passNode = this;
  }

}