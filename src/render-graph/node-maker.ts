import { PassGraphNode } from "./node/pass-graph-node";
import { RenderTargetNode } from "./node/render-target-node";

export function pass(name: string) {
  return new PassGraphNode(name);
}

export function pingpong(name: string, tickId: number) {
  
}

export function target(name: string) {
  return new RenderTargetNode(name);
}

export function screen() {
  return new RenderTargetNode();
}