import { ARTEngine } from "../engine/render-engine";

/**
 * texture container for bitmap render data
 * 
 * @export
 * @class Texture
 */
export class Texture {

  image?: HTMLImageElement;
  textureData?: Uint8ClampedArray;
  glTextureId: string;
  updateVersionId: number = 0;

  setNeedUpdate() {
    this.updateVersionId++;
  }

  getGLTexture(engine: ARTEngine): WebGLTexture {
    return engine.getGLTexture(this);
  }

  
}