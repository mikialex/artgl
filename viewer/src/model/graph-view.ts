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


export class ConnectionLine {
  startX: number = 0;
  startY: number = 0;
  endX: number = 0;
  endY: number = 0;

  draw(hud: LinesHUD, boardInfo: GraphBoardInfo) {
    const ctx = hud.ctx;
    ctx.beginPath();
    ctx.moveTo(this.startX + boardInfo.transformX, this.startY + boardInfo.transformY);
    ctx.lineTo(this.endX + boardInfo.transformX, this.endY + boardInfo.transformY);
    ctx.stroke();
  }
}

export class LinesHUD {
  constructor(el: HTMLCanvasElement) {
    this.el = el;
    this.ctx = el.getContext('2d');
  }
  el: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number = 0;
  height: number = 0;

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  draw(lines: ConnectionLine[], boardInfo: GraphBoardInfo) {
    this.clear();
    lines.forEach(line => line.draw(this, boardInfo));
  }
}