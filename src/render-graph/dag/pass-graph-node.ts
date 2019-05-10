import { DAGNode } from "./dag-node";
import { PassDefine, PassInputMapInfo } from "../interface";
import { RenderGraph } from "../render-graph";
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
    // deconnect all depends node
    Object.keys(this.inputs).forEach(inputUniformKey => {
      const frambufferName = this.inputs[inputUniformKey]
      const renderTargetNode = this.graph.getRenderTargetDependence(frambufferName);
      if (renderTargetNode === undefined) {
        throw `render graph updating error, renderTarget depend ${frambufferName} cant found`;
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
        throw `render graph updating error, renderTarget depend ${frambufferName} cant found`;
      }
      renderTargetNode.connectTo(this);
    })
  }

  updatePass(activeNodes: DAGNode[]) {
    this.pass.updateInputTargets(this.inputs);
    let hasFoundTarget = false;
    this.toNode.forEach(node => {
      if (node instanceof RenderTargetNode) {
        for (let i = 0; i < activeNodes.length; i++) {
          if (activeNodes[i] === node) {
            if (hasFoundTarget) {
              throw 'output recive multiple active pass'
            }
            hasFoundTarget = true
            this.pass.setOutPutTarget(node);
          }
        }
      }
    })
  }

  pass: RenderPass;

}