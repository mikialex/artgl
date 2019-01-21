import { GLRenderer } from "../gl-renderer";
import { Vector4 } from "../../math/vector4";

export class GLColorBuffer{
  constructor(renderer: GLRenderer) {
    this.gl = renderer.gl;
  }

  readonly gl: WebGLRenderingContext;

  redMaskEnabled: boolean = false;
  greenMaskEnabled: boolean = false;
  blueMaskEnabled: boolean = false;
  alphaMaskEnabled: boolean = false;

  /**
   * set color buffer mask, inner has diff check
   *
   * @param {boolean} redMask whether enable red channel color mask
   * @param {boolean} greenMask whether enable green channel color mask
   * @param {boolean} blueMask whether enable blue channel color mask
   * @param {boolean} alphaMask whether enable alpha channel color mask
   * @memberof GLColorBuffer
   */
  setColorMask(redMask: boolean, greenMask: boolean, blueMask: boolean, alphaMask: boolean) {
    if (this.redMaskEnabled !== redMask ||
      this.greenMaskEnabled !== greenMask ||
      this.blueMaskEnabled !== blueMask ||
      this.alphaMaskEnabled !== alphaMask
    ) {
      this.gl.colorMask(redMask, greenMask, blueMask, alphaMask);
      this.redMaskEnabled = redMask;
      this.greenMaskEnabled = greenMask;
      this.blueMaskEnabled = blueMask;
      this.alphaMaskEnabled = alphaMask;
    }
  }

  currentClearColor: Vector4 = new Vector4();
  setClearColor(newColor: Vector4, premultipliedAlpha: boolean) {
    
  }

  clear() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  }
}
