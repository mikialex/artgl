import { PassGraphNode } from "./node/pass-graph-node";
import { RenderTargetNode } from "./node/render-target-node";
import { RenderGraph } from './exports';

export function pass(name: string) {
  return new PassGraphNode(name);
}

export class PingPongTarget{
  constructor(name: string) {
    this.ATarget = target(name + "-A")
    this.BTarget = target(name + "-A")
  }

  private tickId: number = 0;
  private ATarget: RenderTargetNode;
  private BTarget: RenderTargetNode;

  tick() {
    this.tickId++;
    this.ATarget.clearAllFrom();
    this.ATarget.clearAllTo();
    this.BTarget.clearAllFrom();
    this.BTarget.clearAllTo();
  }

  ping() {
    return this.tickId % 2 === 0 ? this.ATarget : this.BTarget;
  }

  pong() {
    return this.tickId % 2 === 0 ? this.BTarget : this.ATarget;
  }
}

export function pingpong(name: string) {
  return new PingPongTarget(name);
}

export function target(name: string) {
  return new RenderTargetNode(name);
}

export function screen() {
  return new RenderTargetNode(RenderGraph.screenRoot);
}

export function when<Y, N>(condition: boolean, yes: Y, no: N) {
  return condition? yes: no
}
