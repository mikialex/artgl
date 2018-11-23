import { GLRenderer } from "./webgl-renderer";

export class GLState{
  constructor(renderer: GLRenderer) {
    this.renderer = renderer;
    this.gl = renderer.gl;
  }
  renderer: GLRenderer;
  gl: WebGLRenderingContext;

  viewport(x: number, y:number, width:number, height:number) {
    // specifies the affine transformation of x and y 
    // from normalized device coordinates to window coordinates.
    this.gl.viewport( x, y, width, height );
  }

}