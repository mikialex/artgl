import { ARTEngine } from "../engine/render-engine";

export class Texture {
  constructor() {
    
  }

  gltextureId: string;

  getGLTexture(engine: ARTEngine): WebGLTexture {

    return engine.getGLTexture(this);
  }

  
}