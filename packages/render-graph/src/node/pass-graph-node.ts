import { DAGNode, Observable } from "@artgl/shared"
import { RenderPass, uniformName } from "../pass";
import { Nullable } from "@artgl/shared";
import { RenderTargetNode } from "./render-target-node";
import { Vector4 } from "@artgl/math";
import { ShadingHandle } from "artgl";
import { RenderMethod } from "../interface";

export interface PassInputMapInfo{
  [index:string]: string
}

export class PassGraphNode extends DAGNode {
  static QuadRenderMethods: RenderMethod
  constructor(name: string) {
    super();
    this.name = name;
  }

  // if this pass use a override shading, input will act as override shading texture input
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
    this.inputs.forEach(n => {
      n.disconnectTo(this);
    })
    this.inputs.clear();
  }

  // if some drawcall in this pass need target rendered before, use this
  _depends: RenderTargetNode[] = [];
  depend(node: RenderTargetNode) {
    this._depends.push(node)
    node.connectTo(this);
    return this;
  }
  clearAllDepends() {
    this._depends.forEach(n => {
      n.disconnectTo(this);
    })
    this._depends = [];
    return this;
  }

  readonly name: string;

  source: RenderMethod[] = [];
  use(source: RenderMethod) {
    this.source.push(source);
    return this;
  }
  useQuad() {
    if (!PassGraphNode.QuadRenderMethods) {
      throw 'PassGraphNode.QuadRenderMethods should be set for this usage'
    }
    this.source.push(PassGraphNode.QuadRenderMethods)
    return this;
  }
  clearUse() {
    this.source = [];
    return this;
  }

  _overrideShading: Nullable<ShadingHandle> = null;
  overrideShading(shading: Nullable<ShadingHandle>) {
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

  _beforePassExecute = new Observable<PassGraphNode>();
  beforeExecute(callback: (node:PassGraphNode) => any) {
    this._beforePassExecute.add(callback);
    return this;
  }

  _afterPassExecute = new Observable<PassGraphNode>();
  afterExecute(callback: (node:PassGraphNode) => any) {
    this._afterPassExecute.add(callback);
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