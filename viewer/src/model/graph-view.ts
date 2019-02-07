import { RenderGraph } from '../../../src/artgl';
import { PassGraphNode } from '../../../src/render-graph/dag/pass-graph-node';
import { DAGNode } from '../../../src/render-graph/dag/dag-node';
import { RenderTargetNode } from '../../../src/render-graph/dag/render-target-node';

export class GraphView {
  passNodes: GraphNodeView[] = [];
  targetNodes: GraphNodeView[] = [];
  passNodeMap: Map<string, GraphNodeView> = new Map();
  static create(graph: RenderGraph) {
    const view = new GraphView;
    graph.passNodes.forEach(node => {
      const nodeView = GraphNodeView.create(node)
      view.passNodeMap.set(node.uuid, nodeView)
      view.passNodes.push(nodeView);
    })
    graph.renderTargetNodes.forEach(node => {
      const nodeView = GraphNodeView.create(node)
      view.passNodeMap.set(node.uuid, nodeView)
      view.passNodes.push(nodeView);
    })
    return view;
  }

}

export class GraphNodeView {
  name: string;
  uuid: string;
  width: number = 100;
  height: number = 100;
  positionX: number = 0;
  positionY: number = 0;
  inputsID: string[];

  static create(node: DAGNode) {
    const view = new GraphNodeView();
    view.uuid = node.uuid;
    view.inputsID = [];
    node.forFromNode(node => {
      view.inputsID.push(node.uuid);
    })

    if (node instanceof PassGraphNode) {
      view.name = node.name;
    } else if (node instanceof RenderTargetNode) {
      view.name = node.name;
    }
    return view;
  }

  getConnectionLines(graph: GraphView) {
    return this.inputsID.map(id => {
      const inputNode = graph.passNodeMap.get(id);
      return {
        id: this.uuid + inputNode.uuid,
        line: createConectionSVGLine(
          inputNode.positionX + inputNode.width,
          inputNode.positionY + inputNode.height / 2,
          this.positionX,
          this.positionY + this.height / 2
        )
      }
    })
  }

}


function createConectionSVGLine(
  x1: number, y1: number,
  x2: number, y2: number) {
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