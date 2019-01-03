import { DAGNode } from "./dag-node";
import { PassDefine, TextureDefine } from "../interface";
import { RenderGraph } from "../render-graph";

export class TextureNode extends DAGNode{
  constructor(graph: RenderGraph, define: TextureDefine) {
    super();
    this.name = define.name;
    this.define = define;
    this.graph = graph;
  }
  readonly name: string;
  readonly define: TextureDefine;
  readonly graph: RenderGraph;

  textureDependency = [];
}