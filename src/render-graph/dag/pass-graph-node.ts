import { DAGNode } from "./dag-node";
import { PassDefine, PassInputMapInfo } from "../interface";
import { RenderGraph } from "../render-graph";
import { RenderPass } from "../pass";
import { RenderTargetNode } from './render-target-node';
import { Nullable } from "../../type";
import { RenderGraphNode } from "../effect-composer";

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
    // deconnect all depends node
    Object.keys(this.inputs).forEach(inputUniformKey => {
      const frambufferName = this.inputs[inputUniformKey]
      const renderTargetNode = this.graph.getRenderTargetDependence(frambufferName);
      if (renderTargetNode === undefined) {
        throw `render graph updating error, renderTarget depend node ${frambufferName} cant found`;
      }
      renderTargetNode.deConnectTo(this);
    })
    // reeval getter
    if (this.inputsGetter !== null) {
      this.inputs = this.inputsGetter();
    }
    // connect new depends node
    Object.keys(this.inputs).forEach(inputUniformKey => {
      const frambufferName = this.inputs[inputUniformKey]
      const renderTargetNode = this.graph.getRenderTargetDependence(frambufferName);
      if (renderTargetNode === undefined) {
        throw `render graph updating error, renderTarget depend node ${frambufferName} cant found`;
      }
      renderTargetNode.connectTo(this);
    })
  }

  updatePass(activeNodes: RenderGraphNode[]) {
    this.pass.updateInputTargets(this.inputs);
    let foundedNode = null;
    this.toNode.forEach(node => {
      if (node instanceof RenderTargetNode) {
        for (let i = 0; i < activeNodes.length; i++) {
          if (activeNodes[i] === node) {
            if (foundedNode !== null) {
              throw `RenderGraph update error: one target node should only has one pass targeted;
privous found target pass: ${foundedNode.name};
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