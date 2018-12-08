import { GLRenderer } from "webgl/webgl-renderer";
import { GLTextureType } from "webgl/const";

interface textureBindInfo {
  type: GLTextureType,
  texture: WebGLTexture
}

/**
 * manage gl state about texture usage
 *
 * @export
 * @class GLTextureSlot
 */
export class GLTextureSlot{
  constructor(renderer: GLRenderer) {
    this.renderer = renderer;
    this.gl = renderer.gl;
    this.slot = new Array(renderer.glInfo.maxTextures).fill('');
  }
  readonly renderer;
  readonly gl;
  private slot: string[] = [];

  private currentTextureSlot = null;
  private currentBindTextures: textureBindInfo[];

  activeTexture(slot: number) {
    if ( this.currentTextureSlot !== slot ) {
      this.gl.activeTexture(slot);
			this.currentTextureSlot = slot;
		}
  }

  bindTexture(webglType: GLTextureType, webglTexture: WebGLTexture ) {
		if ( this.currentTextureSlot === null ) {
			this.activeTexture(0);
		}
		let boundTexture = this.currentBindTextures[ this.currentTextureSlot ];
		if ( boundTexture === undefined ) {
			boundTexture = { type: undefined, texture: undefined };
      this.currentBindTextures[this.currentTextureSlot] = boundTexture;
		}
		if ( boundTexture.type !== webglType || boundTexture.texture !== webglTexture ) {
			this.gl.bindTexture( webglType, webglTexture);
			boundTexture.type = webglType;
			boundTexture.texture = webglTexture;
		}
	}

  findSlot(webgltexture: WebGLTexture): number {
    return 0;
  }  

  updateSlotTexture(webgltexture: WebGLTexture): number {
    return 0;
  }
}