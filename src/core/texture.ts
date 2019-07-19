import { ARTEngine } from "../engine/render-engine";
import { PixelFormat } from "../webgl/const";

/**
 * texture container for bitmap render data
 * 
 * @export
 * @class Texture
 */
export abstract class Texture {

  glTextureId: string;
  updateVersionId: number = 0;

  format: PixelFormat

  setNeedUpdate() {
    this.updateVersionId++;
  }

  getGLTexture(engine: ARTEngine): WebGLTexture {
    return engine.getGLTexture(this);
  }

  abstract upload(engine: ARTEngine): void;
}

export class DataTexture extends Texture {
  data?: Uint8ClampedArray;

  upload(engine: ARTEngine): void {
    throw new Error("Method not implemented.");
  }
}

export class HTMLImageTexture extends Texture{
  
  image: HTMLImageElement;

  upload(engine: ARTEngine) {
    this.glTextureId = engine.renderer.textureManger.createTextureFromImageElement(this.image);
  }
}