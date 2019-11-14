import { GLRenderer } from "../gl-renderer";
import { Vector4Simple, Vector4Like } from "./math-util";

export class GLColorBuffer{
  static defaultClearColor = new Vector4Simple(0.8, 0.8, 0.8, 1);
  constructor(renderer: GLRenderer) {
    this.gl = renderer.gl;
    this.resetDefaultClearColor();
  }

  private gl: WebGLRenderingContext;

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

  // TODO premultiplied alpha
  currentClearColor = new Vector4Simple();
  setClearColor(newColor: Vector4Like, _premultipliedAlpha?: boolean) {
    if (!newColor.equals(this.currentClearColor)) {
      this.currentClearColor.copy(newColor);
      this.gl.clearColor(newColor.x, newColor.y, newColor.z, newColor.w);
    }
  }

  resetDefaultClearColor() {
    this.setClearColor(GLColorBuffer.defaultClearColor);
  }

  clear() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  }
}
