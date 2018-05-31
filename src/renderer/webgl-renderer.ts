import { GLShader, ShaderType } from "../webgl/shader";
import { GLInfo } from "../webgl/gl-info";
import { RenderList } from "./render-list";
import { GLProgram } from "./webgl-program";

export class GLRenderer {
  constructor(el: HTMLCanvasElement, options?: any) {
    this._gl = el.getContext('webgl', options);
    this.glInfo = new GLInfo(this);
    this.glInfo.createAllExtension();
  }
  private _gl: WebGLRenderingContext;
  get gl() { return this._gl };
  glInfo: GLInfo;
  renderList: RenderList = new RenderList();

  program: GLProgram

  render() {
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);
  }

  clear() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  }
  
}
