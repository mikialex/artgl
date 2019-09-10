import { PassGraphNode } from "./node/pass-graph-node";
import { RenderTargetNode } from "./node/render-target-node";
import { RenderGraph } from './exports';

export function pass(name: string) {
  return new PassGraphNode(name);
}

export function pingpong(name: string, tickId: number) {
  const ATarget = target(name + "-A")
  const BTarget = target(name + "-B")
  const isEvenTick = tickId % 2 === 0;
  return {
    ping: () => {
      return isEvenTick ? ATarget : BTarget;
    },
    pong: () => {
      return isEvenTick ? BTarget : ATarget;
    }
  }
}

export function target(name: string) {
  return new RenderTargetNode(name);
}

export function screen() {
  return new RenderTargetNode(RenderGraph.screenRoot);
}