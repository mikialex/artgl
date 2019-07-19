import { RenderEngine } from "../engine/render-engine";
import { GraphicResourceReleasable } from "../type";

export enum PixelFormat {
  AlphaFormat = 1021,
  RGBFormat = 1022,
  RGBAFormat = 1023,
}

export enum PixelDataType {
  UNSIGNED_BYTE,
  UNSIGNED_SHORT_5_6_5,
  UNSIGNED_SHORT_4_4_4_4,
  UNSIGNED_SHORT_5_5_5_1,
  FLOAT,
}

/**
 * texture container for bitmap render data
 * 
 * @export
 * @class Texture
 */
export abstract class Texture implements GraphicResourceReleasable {

  private needUpdate: boolean = true;

  format: PixelFormat = PixelFormat.RGBAFormat
  dataType: PixelDataType = PixelDataType.UNSIGNED_BYTE

  setNeedUpdate() {
    this.needUpdate = true;
  }

  getGLTexture(engine: RenderEngine): WebGLTexture {
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

  releaseGraphics(engine: RenderEngine) {
    engine.renderer.textureManger.deleteGLTexture(this);
  }

  abstract upload(engine: RenderEngine): WebGLTexture;
}

export class DataTexture extends Texture {
  data?: Uint8ClampedArray;

  upload(engine: RenderEngine): WebGLTexture {
    // TODO
    throw new Error("Method not implemented.");
  }
}

export class HTMLImageTexture extends Texture{
  
  image: HTMLImageElement;

  upload(engine: RenderEngine) {
    return engine.renderer.textureManger.createTextureFromImageElement(this);
  }
}