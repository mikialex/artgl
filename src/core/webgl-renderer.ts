export class WebGLRenderer {
  constructor(el:HTMLCanvasElement, options?:any) {
    this.gl = el.getContext('webgl', options);
  }
  gl: WebGLRenderingContext;

  
}




