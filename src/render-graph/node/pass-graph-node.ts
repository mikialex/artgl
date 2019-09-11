import { DAGNode } from "../../core/dag-node";
import { RenderGraph } from "../render-graph";
import { RenderPass, uniformName } from "../pass";
import { Nullable } from "../../type";
import { RenderTargetNode } from "../exports";
import { Vector4 } from "../../math";
import { Observable } from "../../core/observable";
import { Shading } from "../../artgl";
import { QuadSourceInstance } from "../../engine/render-source";

export interface PassInputMapInfo{
  [index:string]: string
}

export class PassGraphNode extends DAGNode {
  constructor(name: string) {
    super();
    this.name = name;
  }

  inputs: Map<uniformName, RenderTargetNode> = new Map();
  input(inputKey: string, node: RenderTargetNode) {
    const nodeBefore = this.inputs.get(inputKey);
    if (nodeBefore !== undefined) {
      nodeBefore.disconnectTo(this);
    }
    this.inputs.set(inputKey, node);
    node.connectTo(this);
    return this;
  }
  clearAllInput() {
    this.inputs.clear();
    this.clearAllFrom();
  }

  readonly name: string;

  source: Function[] = [];
  use(source: Function) {
    this.source.push(source);
    return this;
  }
  useQuad() {
    this.source.push(QuadSourceInstance.render)
    return this;
  }
  clearUse() {
    this.source = [];
    return this;
  }

  _overrideShading: Nullable<Shading> = null;
  overrideShading(shading: Nullable<Shading>) {
    this._overrideShading = shading;
    return this;
  }

  _enableColorWrite: boolean = true;
  enableColorWrite() {
    this._enableColorWrite = true;
    return this;
  }
  disableColorWrite() {
    this._enableColorWrite = false;
    return this;
  }

  _enableColorClear: boolean = true;
  enableColorClear() {
    this._enableColorClear = true;
    return this;
  }
  disableColorClear() {
    this._enableColorClear = false;
    return this;
  }

  _enableDepthWrite: boolean = true;
  _enableDepthClear:boolean = true;
  _clearColor = new Vector4(1, 1, 1, 1);

  beforePassExecute = new Observable<PassGraphNode>();
  beforeExecute(callback: (node:PassGraphNode) => any) {
    this.beforePassExecute.add(callback);
    return this;
  }

  afterPassExecute = new Observable<PassGraphNode>();
  afterExecute(callback: (node:PassGraphNode) => any) {
    this.afterPassExecute.add(callback);
    return this;
  }


  // from updated graph structure, setup render pass
  updatePass(pass: RenderPass) {
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