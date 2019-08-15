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
  const positionMap: Map<DAGNode, number> = new Map();
  function removeItem(node: DAGNode) {
    horizonArray.forEach((row: DAGNode[]) => {
      const index = row.indexOf(node);
      if (index !== -1) {
        row.splice(index, 1)
        positionMap.delete(node)
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
    positionMap.set(node, horizonPosition)

    node.fromNodes.forEach(input => {
      addNode(input, horizonPosition + 1);
    })
  }
  addNode(rootNode, 0);

  horizonArray.forEach(arr => {
    arr.forEach(node => {
      node.toNodes.forEach(n => {
        const nPositon = positionMap.get(n);
        const nodePosition = positionMap.get(node);
        if (nodePosition <= nPositon) {
          let arrToMove = horizonArray[nPositon + 1];
          if (arrToMove === undefined) {
            horizonArray[nPositon + 1] = [];
            arr = horizonArray[nPositon + 1];
          }
          removeItem(node)
          arrToMove.push(node)
          positionMap.set(node, nPositon + 1)
        }
      })
    })
  })

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
    const xCenter = (startX + endX) / 2;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.bezierCurveTo(
      xCenter, startY,
      xCenter, endY,
      endX, endY);
    ctx.stroke();
  }

  drawViewNode(node: DAGNode, nodeLayoutMap: Map<DAGNode, NodeLayout>) {
    const selfLayout = nodeLayoutMap.get(node);
    node.fromNodes.forEach(n => {
      const nodeLayout = nodeLayoutMap.get(n);
      this.drawConnectionLine(
        nodeLayout.absX + 200, nodeLayout.absY,
        selfLayout.absX, selfLayout.absY
      );
    })
  }

  drawViewNodes(nodes: DAGNode[], nodeLayoutMap: Map<DAGNode, NodeLayout>) {
    this.ctx.strokeStyle = "#580"
    this.ctx.save(); 
    this.ctx.translate(this.boardInfo.transformX, this.boardInfo.transformY);
    nodes.forEach(n => {
      this.drawViewNode(n, nodeLayoutMap)
    })
    this.ctx.restore(); 
  }

  drawGrid() {
    const ctx = this.ctx;
    ctx.strokeStyle = "#ddd"
    const gridGapSize = 50;

    for (let i = 0; i < this.height; i += gridGapSize) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(this.width, i);
      ctx.stroke();
    }

    for (let i = 0; i < this.width; i += gridGapSize) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, this.height);
      ctx.stroke();
    }
  }

}

