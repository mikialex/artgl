import { DAGNode } from "../../core/dag-node";
import { PassDefine, PassInputMapInfo } from "../interface";
import { RenderGraph, RenderGraphNode } from "../render-graph";
import { RenderPass } from "../pass";
import { RenderTargetNode } from './render-target-node';
import { Nullable } from "../../type";
import { RenderEngine } from "../../engine/render-engine";

export class PassGraphNode extends DAGNode {
  constructor(graph: RenderGraph, define: PassDefine) {
    super();
    this.name = define.name;

    this.pass = new RenderPass(graph, define);

    if (define.inputs !== undefined) {
      this.inputsGetter = define.inputs;
      this.updateDependNode(graph);
    }

  }
  private inputsGetter: Nullable<() => PassInputMapInfo> = null
  inputs: PassInputMapInfo = {}
  readonly name: string;

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

  updatePass(engine: RenderEngine, activeNodes: RenderGraphNode[]) {
    this.pass.updateInputTargets(this.inputs);
    let foundedNode = null;
    if (this.toNodes.size === 0) {
      throw "cant found render target node for a render pass"
    }
    this.toNodes.forEach(node => {
      if (node instanceof RenderTargetNode) {
        for (let i = 0; i < activeNodes.length; i++) {
          if (activeNodes[i] === node) {
            if (foundedNode !== null) {
              throw `RenderGraph update error: one target node should only has one pass targeted;
previous found target pass: ${foundedNode.name};
new found target pass: ${activeNodes[i].name};
              `
            }
            foundedNode = node
            this.pass.setOutPutTarget(engine, node);
          }
        }
      }
    })
    this.pass.checkIsValid();
  }

  pass: RenderPass;

}