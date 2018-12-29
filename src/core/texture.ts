import { ARTEngine } from "../engine/render-engine";

/**
 * texture container for bitmap render data
 * 
 * @export
 * @class Texture
 */
export class Texture {
  constructor() {
    
  }

  image: HTMLImageElement;
  gltextureId: string;

  getGLTexture(engine: ARTEngine): WebGLTexture {

    return engine.getGLTexture(this);
  }

  
}