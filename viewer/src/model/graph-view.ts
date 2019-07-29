import { RenderGraph } from '../../../src/artgl';
import { PassGraphNode } from '../../../src/render-graph/node/pass-graph-node';
import { DAGNode } from '../../../src/core/dag-node';
import { RenderTargetNode } from '../../../src/render-graph/node/render-target-node';


export interface GraphBoardInfo{
  width: number,
  height: number,
  transformX :number,
  transformY :number,
}

export interface NodeLayout{
  absX:number,
  absY:number,
  width: number,
  height: number,
}

export interface ViewNode {
  node: DAGNode;
  layout: NodeLayout;
}


export function layoutGraph(
  rootNode: DAGNode,
  layoutNodeMap: { [index: string]: NodeLayout },
  gridSize = 300
) {

  const horizonArray: Array<Array<DAGNode>> = [];
  function removeItem(node: DAGNode) {
    horizonArray.forEach((row: DAGNode[]) => {
      const index = row.indexOf(node);
      if (index !== -1) {
        row.splice(index, 1)
      }
    })
  }
  function addNode(node: DAGNode, horizonPosition: number) {
    let arr = horizonArray[horizonPosition];
    if (arr === undefined) {
      horizonArray[horizonPosition] = [];
      arr = horizonArray[horizonPosition];
    }
    removeItem(node);
    arr.push(node)

    node.fromNodes.forEach(input => {
      addNode(input, horizonPosition + 1);
    })
  }
  addNode(rootNode, 0);
  horizonArray.reverse().forEach((row, indexRow) => {
    row.forEach((item, indexY) => {

      const layout = layoutNodeMap[item.uuid]
      if (layout === undefined) {
        throw 'cant find nodes layout'
      }

      layout.absX = indexRow * gridSize;
      layout.absY = indexY * gridSize
    })
  })
}

// export class GraphView {
//   nodes: GraphNodeView[] = [];
//   nodeMap: Map<string, GraphNodeView> = new Map();
//   rootNode: GraphNodeView

//   static targetNodeDefaultSize = 200;
//   static create(graph: RenderGraph) {
//     const view = new GraphView;
//     graph.passNodes.forEach(node => {
//       const nodeView = GraphNodeView.create(node)
//       view.nodeMap.set(node.uuid, nodeView)
//       view.nodes.push(nodeView);
//     })
//     graph.renderTargetNodes.forEach(node => {
//       const nodeView = GraphNodeView.create(node)
//       view.nodeMap.set(node.uuid, nodeView)
//       view.nodes.push(nodeView);
//     })

//     view.nodes.forEach(node => {
//       node.inputsID.forEach(id => {
//         node.inputs.push(view.nodeMap.get(id));
//       })
//     })
//     view.rootNode = view.nodeMap.get(graph.getRootScreenTargetNode().uuid)
//     if (!view.rootNode) {
//       throw "cant find root";
//     }
//     view.layout();
//     return view;
//   }

//   layout() {
//     this.nodes.forEach(node => {
//       if (node.type === GraphNodeViewType.targetNode) {
//         node.width = GraphView.targetNodeDefaultSize;
//         node.height = GraphView.targetNodeDefaultSize;
//       }
//     })
//     genGraphLayout(this.rootNode)
//   }
// }

// function genGraphLayout(rootNode: GraphNodeView) {
//   const horizonArray = [];
//   function removeItem(node: GraphNodeView){
//     horizonArray.forEach((row: GraphNodeView[])=> {
//       const index = row.indexOf(node);
//       if (index !== -1) {
//         row.splice(index, 1)
//       }
//     })
//   }
//   function addNode(node: GraphNodeView, horizonPosition: number) {
//     let arr = horizonArray[horizonPosition];
//     if (arr === undefined) {
//       horizonArray[horizonPosition] = [];
//       arr = horizonArray[horizonPosition];
//     }
//     removeItem(node);
//     arr.push(node) 
    
//     node.inputs.forEach(input => {
//       addNode(input, horizonPosition + 1);
//     })
//   }
//   addNode(rootNode, 0);
//   const gridSize = 300;
//   horizonArray.reverse().forEach((row, indexRow) => {
//     row.forEach((item: GraphNodeView, indexY: number) => {
//       item.positionX = indexRow * gridSize;
//       item.positionY = indexY * gridSize
//     })
//   })
// }

// export enum GraphNodeViewType{
//   passNode,
//   targetNode,
//   shaderFuncNode
// }

// interface GraphNodeInputDefineView{
//   name: string
// }

// export class GraphNodeView {
//   name: string;
//   uuid: string;
//   width: number = 200;
//   height: number = 200;
//   positionX: number = 0;
//   positionY: number = 0;
//   inputsID: string[] = [];
//   inputs: GraphNodeView[] = [];

//   inputDefine: GraphNodeInputDefineView[] = [];
//   type: GraphNodeViewType;

//   static create(node: DAGNode) {
//     const view = new GraphNodeView();
//     view.uuid = node.uuid;
//     view.inputsID = [];
//     node.fromNodes.forEach(node => {
//       view.inputsID.push(node.uuid);
//     })

//     if (node instanceof PassGraphNode) {
//       view.name = node.name;
//       if (node.inputs !== undefined) {
//         view.inputDefine = Object.keys(node.inputs).map(key => {
//           return {
//             name: key
//           }
//         })
//       }
//       view.height = 20 + view.inputDefine.length * 20;
//       view.type = GraphNodeViewType.passNode;
//     } else if (node instanceof RenderTargetNode) {
//       view.name = node.name;
//       view.type = GraphNodeViewType.targetNode;
//     }
//     return view;
//   }

//   getConnectionLines(graph: GraphView, boardInfo) {
//     return this.inputsID.map((id, index) => {
//       const inputNode = graph.nodeMap.get(id);
//       return {
//         id: this.uuid + inputNode.uuid,
//         line: createConnectionSVGLine(
//           inputNode.positionX + inputNode.width + boardInfo.transformX,
//           inputNode.positionY + inputNode.height / 2 + boardInfo.transformY,
//           this.positionX + boardInfo.transformX,
//           this.positionY + boardInfo.transformY + index * 20 + 20
//         )
//       }
//     })
//   }

// }


function createConnectionSVGLine(
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