import { EffectComposer } from "./effect-composer";

export class RenderGraph{
  constructor(){

  }
  composer: EffectComposer

  render() {
    this.composer.render();
  }

  setGraph() {
    
  }
}