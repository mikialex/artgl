import { ShaderGraph } from '../../src/shader-graph/shader-graph';

export class ShaderApplication {

  canvas: HTMLCanvasElement;
  graph: ShaderGraph = new ShaderGraph();

  init(canvas: HTMLCanvasElement) {
    
  }

  uninit() {
    
  }


}


export let ShaderApp: ShaderApplication = new ShaderApplication();