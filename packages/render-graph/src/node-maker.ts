import { PassGraphNode } from "./node/pass-graph-node";
import { RenderTargetNode } from "./node/render-target-node";
import { RenderGraph } from './render-graph';

export function pass(name: string) {
  return new PassGraphNode(name);
}

export class PingPongTarget{
  constructor(name: string) {
    this.ATarget = target(name + "-A")
    this.BTarget = target(name + "-B")
  }

  private tickId: number = 0;
  private ATarget: RenderTargetNode;
  private BTarget: RenderTargetNode;

  tick() {
    this.tickId++;
    this.ATarget.cleanConnections()
    this.BTarget.cleanConnections();
  }

  get evenTick() {
    return this.tickId % 2 === 0
  }

  // always for input
  ping() {
    return (this.evenTick ? this.ATarget : this.BTarget).notNeedKeepContent();
  }

  // always for output
  pong() {
    return (this.evenTick ? this.BTarget : this.ATarget).keepContent();
  }
}

export function pingpong(name: string) {
  return new PingPongTarget(name);
}

export function target(name: string) {
  return new RenderTargetNode(name, false);
}

export function screen() {
  return new RenderTargetNode(RenderGraph.screenRoot, true);
}

export function when<Y, N>(condition: boolean, yes: Y, no: N) {
  return condition? yes: no
}
