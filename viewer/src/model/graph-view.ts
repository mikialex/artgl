import { RenderGraph } from '../../../src/artgl';
import { PassGraphNode } from '../../../src/render-graph/dag/pass-graph-node';
import { DAGNode } from '../../../src/render-graph/dag/dag-node';
import { RenderTargetNode } from '../../../src/render-graph/dag/render-target-node';

import { ShaderGraph } from '../../../src/shader-graph/shader-graph';
import { ShaderFunctionNode } from '../../../src/shader-graph/shader-node';

export class GraphView {
  nodes: GraphNodeView[] = [];
  nodeMap: Map<string, GraphNodeView> = new Map();
  rootNode: GraphNodeView

  static targetNodeDefaultSize = 200;
  static create(graph: RenderGraph) {
    const view = new GraphView;
    graph.passNodes.forEach(node => {
      const nodeView = GraphNodeView.create(node)
      view.nodeMap.set(node.uuid, nodeView)
      view.nodes.push(nodeView);
    })
    graph.renderTargetNodes.forEach(node => {
      const nodeView = GraphNodeView.create(node)
      view.nodeMap.set(node.uuid, nodeView)
      view.nodes.push(nodeView);
    })

    view.nodes.forEach(node => {
      node.inputsID.forEach(id => {
        node.inputs.push(view.nodeMap.get(id));
      })
    })
    view.rootNode = view.nodeMap.get(graph.getRootScreenTargetNode().uuid)
    if (!view.rootNode) {
      throw "cant find root";
    }
    view.layout();
    return view;
  }

  static createFromShaderGraph(graph: ShaderGraph) {
    const view = new GraphView();
    graph.functionNodes.forEach(node => {
      const nodeView = GraphNodeView.create(node)
      view.nodeMap.set(node.uuid, nodeView)
      view.nodes.push(nodeView);
    })
    graph.inputNodes.forEach(node => {
      const nodeView = GraphNodeView.create(node)
      view.nodeMap.set(node.uuid, nodeView)
      view.nodes.push(nodeView);
    })
    
    view.nodes.forEach(node => {
      node.inputsID.forEach(id => {
        node.inputs.push(view.nodeMap.get(id));
      })
    })

    view.rootNode = view.nodeMap.get(graph.effectRoot.uuid)
    
    view.layout();
    return view;
  }

  layout() {
    this.nodes.forEach(node => {
      if (node.type === GraphNodeViewType.targetNode) {
        node.width = GraphView.targetNodeDefaultSize;
        node.height = GraphView.targetNodeDefaultSize;
      }
    })
    genGraphLayout(this.rootNode)
  }
}

function genGraphLayout(rootNode: GraphNodeView) {
  const horizonArray = [];
  function removeItem(node: GraphNodeView){
    horizonArray.forEach((row: GraphNodeView[])=> {
      const index = row.indexOf(node);
      if (index !== -1) {
        row.splice(index, 1)
      }
    })
  }
  function addNode(node: GraphNodeView, horiPosition: number) {
    let arr = horizonArray[horiPosition];
    if (arr === undefined) {
      horizonArray[horiPosition] = [];
      arr = horizonArray[horiPosition];
    }
    removeItem(node);
    arr.push(node) 
    
    node.inputs.forEach(input => {
      addNode(input, horiPosition + 1);
    })
  }
  addNode(rootNode, 0);
  const gridSize = 300;
  horizonArray.reverse().forEach((row, indexRow) => {
    row.forEach((item: GraphNodeView, indexY: number) => {
      item.positionX = indexRow * gridSize;
      item.positionY = indexY * gridSize
    })
  })
}

export enum GraphNodeViewType{
  passNode,
  targetNode,
  shaderFuncNode
}

interface GraphNodeInputDefineView{
  name: string
}

export class GraphNodeView {
  name: string;
  uuid: string;
  width: number = 200;
  height: number = 200;
  positionX: number = 0;
  positionY: number = 0;
  inputsID: string[] = [];
  inputs: GraphNodeView[] = [];

  inputDefine: GraphNodeInputDefineView[] = [];
  type: GraphNodeViewType;

  static create(node: DAGNode) {
    const view = new GraphNodeView();
    view.uuid = node.uuid;
    view.inputsID = [];
    node.forFromNode(node => {
      view.inputsID.push(node.uuid);
    })

    if (node instanceof PassGraphNode) {
      view.name = node.name;
      if (node.define.inputs !== undefined) {
        view.inputDefine = Object.keys(node.define.inputs()).map(key => {
          return {
            name: key
          }
        })
      }
      view.height = 20 + view.inputDefine.length * 20;
      view.type = GraphNodeViewType.passNode;
    } else if (node instanceof RenderTargetNode) {
      view.name = node.name;
      view.type = GraphNodeViewType.targetNode;
    } else if (node instanceof ShaderFunctionNode) {
      view.name = node.factory.define.name;
      view.type = GraphNodeViewType.shaderFuncNode;
      view.inputDefine = Object.keys(node.define.input).map(key => {
        return {
          name: key
        }
      })
    }
    return view;
  }

  getConnectionLines(graph: GraphView, boardInfo) {
    return this.inputsID.map((id, index) => {
      const inputNode = graph.nodeMap.get(id);
      return {
        id: this.uuid + inputNode.uuid,
        line: createConectionSVGLine(
          inputNode.positionX + inputNode.width + boardInfo.transformX,
          inputNode.positionY + inputNode.height / 2 + boardInfo.transformY,
          this.positionX + boardInfo.transformX,
          this.positionY + boardInfo.transformY + index * 20 + 20
        )
      }
    })
  }

}


function createConectionSVGLine(
  x1: number, y1: number,
  x2: number, y2: number,
  ) {
  const anchorStartX = (x1 + x2) * 0.5;
  return 'M ' + x1 + ' ' +
    y1 +
    ' C ' +
    anchorStartX + ' ' +
    y1 +
    ' , ' +
    anchorStartX + ' ' +
    y2 +
    ' , ' +
    x2 + ' ' +
    y2;
}