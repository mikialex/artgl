import { TestBridge } from "./test-bridge";
import { RenderEngine, Scene } from "../../src/artgl";

export default async function test(testBridge: TestBridge) {
  let canvas = document.querySelector('canvas');
  const engine = new RenderEngine(canvas);

  const scene = new Scene();

}