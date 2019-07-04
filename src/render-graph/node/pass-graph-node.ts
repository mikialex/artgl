import { DAGNode } from "../../core/dag-node";
import { PassDefine, PassInputMapInfo } from "../interface";
import { RenderGraph, RenderGraphNode } from "../render-graph";
import { RenderPass } from "../pass";
import { RenderTargetNode } from './render-target-node';
import { Nullable } from "../../type";

export class PassGraphNode extends DAGNode {
  constructor(graph: RenderGraph, define: PassDefine) {
    super();
    this.graph = graph;
    this.name = define.name;
    this.define = define;

    this.pass = new RenderPass(graph, define);

    if (define.inputs !== undefined) {
      this.inputsGetter = define.inputs;
      this.updateDependNode();
    }

  }
  readonly graph: RenderGraph;
  private inputsGetter: Nullable<() => PassInputMapInfo> = null
  inputs: PassInputMapInfo = {}
  readonly name: string;
  readonly define: PassDefine;

  updateDependNode() {
    // disconnect all depends node
    this.clearAllFrom();

    // reval getter
    const inputs = this.inputs;
    if (this.inputsGetter !== null) {
      this.inputs = this.inputsGetter();
    }
    // connect new depends node
    Object.keys(inputs).forEach(inputUniformKey => {
      const framebufferName = inputs[inputUniformKey]
      const renderTargetNode = this.graph.getRenderTargetDependence(framebufferName);
      if (renderTargetNode === undefined) {
        throw `render graph updating error, renderTarget depend node ${framebufferName} cant found`;
      }
      renderTargetNode.connectTo(inputUniformKey, this);
    })
  }

  updatePass(activeNodes: RenderGraphNode[]) {
    this.pass.updateInputTargets(this.inputs);
    let foundedNode = null;
    this.toNodeMap.forEach(node => {
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
            this.pass.setOutPutTarget(node);
          }
        }
      }
    })
  }

  pass: RenderPass;

}