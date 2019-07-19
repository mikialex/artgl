import { ARTEngine } from "../engine/render-engine";
import { PixelFormat } from "../webgl/const";
import { GraphicResourceReleasable } from "../type";

/**
 * texture container for bitmap render data
 * 
 * @export
 * @class Texture
 */
export abstract class Texture implements GraphicResourceReleasable {

  private needUpdate: boolean = true;

  format: PixelFormat

  setNeedUpdate() {
    this.needUpdate = true;
  }

  getGLTexture(engine: ARTEngine): WebGLTexture {
    const glTexture = engine.renderer.textureManger.getGLTexture(this)
    if (glTexture === undefined) {
      this.needUpdate = false;
      return this.upload(engine);
    }
    if (this.needUpdate) {
      this.needUpdate = false;
      this.releaseGraphics(engine);
      return this.upload(engine);
    }
  }

  releaseGraphics(engine: ARTEngine) {
    engine.renderer.textureManger.deleteGLTexture(this);
  }

  abstract upload(engine: ARTEngine): WebGLTexture;
}

export class DataTexture extends Texture {
  data?: Uint8ClampedArray;

  format = PixelFormat.RGBAFormat;

  upload(engine: ARTEngine): WebGLTexture {
    // TODO
    throw new Error("Method not implemented.");
  }
}

export class HTMLImageTexture extends Texture{
  
  image: HTMLImageElement;

  format = PixelFormat.RGBAFormat;

  upload(engine: ARTEngine) {
    return engine.renderer.textureManger.createTextureFromImageElement(this);
  }
}