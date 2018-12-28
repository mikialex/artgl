import { RenderPass } from "./pass";
import { ARTEngine } from "../engine/render-engine";

export class EffectComposer{
  constructor(engine: ARTEngine) {
    this.engine = engine;
  }

  private engine: ARTEngine;
  private passes: RenderPass[];

  clearPasses() {
    this.passes = [];
  }

  render() {
    this.passes.forEach(pass => {
      pass.execute(this.engine);
    });
  }
}