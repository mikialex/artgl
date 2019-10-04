import { TextureSource } from "./texture-source";
import { PixelDataType, TextureWrap, TextureFilter, RenderEngine } from "../artgl";
import { Nullable } from "../type";

export class CubeTexture {
  positiveXMap: Nullable<TextureSource> = null;
  negativeXMap: Nullable<TextureSource> = null;

  positiveYMap: Nullable<TextureSource> = null;
  negativeYMap: Nullable<TextureSource> = null;

  positiveZMap: Nullable<TextureSource> = null;
  negativeZMap: Nullable<TextureSource> = null;

  private _dataType: PixelDataType = PixelDataType.UNSIGNED_BYTE
  get dataType() { return this._dataType }

  private _wrapS: TextureWrap = TextureWrap.clampToEdge
  get wrapS() { return this._wrapS }

  private _wrapT: TextureWrap = TextureWrap.repeat
  get wrapT() { return this._wrapT }


  private _magFilter: TextureFilter = TextureFilter.nearest
  get magFilter() { return this._magFilter }

  private _minFilter: TextureFilter = TextureFilter.nearest
  get minFilter() { return this._minFilter }

  private version = 0;
  setNeedUpdate() {
    this.version++;
  }
  getVersion() {
    return this.version;
  }

  validateAllTextureSource() {
    if (this.positiveXMap === null) { throw `texture cube not complete, missing positiveXMap` }
    if (this.positiveYMap === null) { throw `texture cube not complete, missing positiveYMap` }
    if (this.positiveZMap === null) { throw `texture cube not complete, missing positiveZMap` }
    if (this.negativeXMap === null) { throw `texture cube not complete, missing negativeXMap` }
    if (this.negativeYMap === null) { throw `texture cube not complete, missing negativeYMap` }
    if (this.negativeZMap === null) { throw `texture cube not complete, missing negativeZMap` }
  }

  getGLTexture(engine: RenderEngine): WebGLTexture {
    const glTexture = engine.renderer.textureManger.getGLTexture(this)
    if (glTexture === undefined) {
      this.setNeedUpdate();
      return engine.renderer.textureManger.createWebGLCubeTexture(this)
    }
    if (engine.renderer.textureManger.texturesVersion.get(this) !== this.version) {
      this.releaseGraphics(engine);
      this.setNeedUpdate();
      return engine.renderer.textureManger.createWebGLCubeTexture(this)
    }
    return glTexture;
  }

  releaseGraphics(engine: RenderEngine) {
    engine.renderer.textureManger.deleteGLTexture(this);
  }

}