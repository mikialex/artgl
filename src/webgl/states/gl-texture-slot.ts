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
    this.maxSupport = renderer.glInfo.maxTextures;
    generateTextureSlotMap(this.maxSupport, this.gl);
  }
  readonly renderer;
  readonly gl;
  readonly maxSupport;

  private currentTextureSlot = null;
  private currentBindTextures: textureBindInfo[] = [];

  activeTexture(slot: number) {
    if ( this.currentTextureSlot !== slot ) {
      this.gl.activeTexture(slot);
			this.currentTextureSlot = slot;
		}
  }

  bindTexture(webglType: GLTextureType, webglTexture: WebGLTexture ) {
		if ( this.currentTextureSlot === null ) {
			this.activeTexture(this.gl.TEXTURE0);
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

  private slotIndex = 0;

  resetSlotIndex() {
    this.slotIndex = 0;
  }

  findSlot(webglTexture: WebGLTexture): number {
    let slot = this.slotIndex;
    if (this.slotIndex > this.maxSupport) {
      throw 'texture use exceed max texture support'
    }
    this.slotIndex++;
    return slot;
  }  

  updateSlotTexture(webglTexture: WebGLTexture): number {
    const textureSlotToUpdate = this.findSlot(webglTexture);
    const textureSlotGLToUpdate = textureSlotMap[textureSlotToUpdate];
    this.activeTexture(textureSlotGLToUpdate);
    this.bindTexture(GLTextureType.texture2D, webglTexture);
    return textureSlotToUpdate;
  }
}

const textureSlotMap:number[] = [];
function generateTextureSlotMap(maxTexureSlotSupport:number, gl: WebGLRenderingContext) {
  for (let i = 0; i < maxTexureSlotSupport; i++) {
    const name = `TEXTURE${i}`;
    textureSlotMap[i] = gl[name];
  }
}