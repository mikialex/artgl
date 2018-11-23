import { GLRenderer } from "../webgl-renderer";
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
}
