import { DAGNode } from '../../../src/core/dag-node';

export interface GraphBoardInfo {
  width: number,
  height: number,
  transformX: number,
  transformY: number,
}

export interface NodeLayout {
  absX: number,
  absY: number,
  width: number,
  height: number,
}

export function getRightEnd(layout: NodeLayout) {
  return {
    x: layout.absX + layout.width,
    y: layout.absY + 10,
  }
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

export class CanvasGraphUI{
  el: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  boardInfo: GraphBoardInfo;
  width: number;
  height: number;

  constructor(el: HTMLCanvasElement, boardInfo: GraphBoardInfo) {
    this.el = el;
    this.ctx = el.getContext('2d');
    this.boardInfo = boardInfo;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }
  
  drawConnectionLine(startX: number, startY: number, endX: number, endY: number) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(startX + this.boardInfo.transformX, startY + this.boardInfo.transformY);
    ctx.lineTo(endX + this.boardInfo.transformX, endY + this.boardInfo.transformY);
    ctx.stroke();
  }

  drawViewNode(node: DAGNode, nodeLayoutMap: Map<DAGNode, NodeLayout>) {
    const selfLayout = nodeLayoutMap.get(node);
    node.fromNodes.forEach(n => {
      const nodeLayout = nodeLayoutMap.get(n);
      this.drawConnectionLine(
        nodeLayout.absX, nodeLayout.absY,
        selfLayout.absX, selfLayout.absY
      );
    })
  }

  drawViewNodes(nodes: DAGNode[], nodeLayoutMap: Map<DAGNode, NodeLayout>) {
    nodes.forEach(n => {
      this.drawViewNode(n, nodeLayoutMap)
    })
  }

}

