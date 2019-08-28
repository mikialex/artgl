import { GLRenderer } from "../gl-renderer";
import { DepthFunction } from "../const";

export class GLDepthBuffer {
  constructor(renderer: GLRenderer) {
    this.gl = renderer.gl;
    this.currentDepthFunc = this.gl.LEQUAL
    this.resetDefault();
  }

  // TODO reset or init set
  currentDepthMask = false;
  currentDepthFunc: number;

  readonly gl: WebGLRenderingContext;

  private _enableTest = false;
  set enableTest(value: boolean) {
    if (this._enableTest !== value) {
      if (value) {
        this.gl.enable(this.gl.DEPTH_TEST);
      } else {
        this.gl.disable(this.gl.DEPTH_TEST);
      }
    }
  }
  get enableTest() {
    return this._enableTest;
  }

  clear() {
    this.gl.clear(this.gl.DEPTH_BUFFER_BIT);
  }

  resetDefault() {
    this.enableTest = true;
    this.enableWrite = true;
    this.setFunc(DepthFunction.LessEqualDepth)
  }

  set enableWrite(value: boolean) {
    if (this.currentDepthMask !== value) {
      this.gl.depthMask(value);
      this.currentDepthMask = value;
    }
  }

  get enableWrite() {
    return this.currentDepthMask;
  }

  setFunc(depthFunc: DepthFunction) {
    const gl = this.gl;
    if (this.currentDepthFunc !== depthFunc) {
      if (depthFunc) {
        switch (depthFunc) {
          case DepthFunction.NeverDepth:
            gl.depthFunc(gl.NEVER);
            break;
          case DepthFunction.AlwaysDepth:
            gl.depthFunc(gl.ALWAYS);
            break;
          case DepthFunction.LessDepth:
            gl.depthFunc(gl.LESS);
            break;
          case DepthFunction.LessEqualDepth:
            gl.depthFunc(gl.LEQUAL);
            break;
          case DepthFunction.EqualDepth:
            gl.depthFunc(gl.EQUAL);
            break;
          case DepthFunction.GreaterEqualDepth:
            gl.depthFunc(gl.GEQUAL);
            break;
          case DepthFunction.GreaterDepth:
            gl.depthFunc(gl.GREATER);
            break;
          case DepthFunction.NotEqualDepth:
            gl.depthFunc(gl.NOTEQUAL);
            break;
          default:
            gl.depthFunc(gl.LEQUAL);
        }
      } else {
        gl.depthFunc(gl.LEQUAL);
      }
      this.currentDepthFunc = depthFunc;
    }
  }

}