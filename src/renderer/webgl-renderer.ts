import { GLShader, ShaderType } from "../webgl/shader";
import { GLInfo } from "../webgl/gl-info";
import { RenderList } from "./render-list";
import { GLProgram } from "../webgl/webgl-program";
import { LightList } from "./light-list";

export class GLRenderer {
  constructor(el: HTMLCanvasElement, options?: any) {
    this.gl = el.getContext('webgl', options);
    this.el = el;
    this.glInfo = new GLInfo(this);
    this.glInfo.createAllExtension();
  }
  gl: WebGLRenderingContext;
  el: HTMLCanvasElement;
  glInfo: GLInfo;
  renderList: RenderList = new RenderList();
  lightList: LightList = new LightList();

  program: GLProgram

  render() {
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);
  }

  clear() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  }
  
}
