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

  updateVersionId: number = 0;

  format: PixelFormat

  setNeedUpdate() {
    this.updateVersionId++;
  }

  getGLTexture(engine: ARTEngine): WebGLTexture {
    const glTexture = engine.renderer.textureManger.getGLTexture(this)
    if (glTexture === undefined) {
      return this.upload
    }
  }

  releaseGraphics(engine: ARTEngine) {
    engine.renderer.textureManger.deleteGLTexture(this);
  }

  abstract upload(engine: ARTEngine): WebGLTexture;
}

export class DataTexture extends Texture {
  data?: Uint8ClampedArray;

  upload(engine: ARTEngine): WebGLTexture {
    throw new Error("Method not implemented.");
  }
}

export class HTMLImageTexture extends Texture{
  
  image: HTMLImageElement;

  upload(engine: ARTEngine) {
    return engine.renderer.textureManger.createTextureFromImageElement(this);
  }
}