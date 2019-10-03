import { TextureSource } from "./texture-source";
import { PixelDataType, TextureWrap, TextureFilter } from "../artgl";

export class CubeTexture {

  positiveXMap: TextureSource;
  negativeXMap: TextureSource;

  positiveYMap: TextureSource;
  negativeYMap: TextureSource;

  positiveZMap: TextureSource;
  negativeZMap: TextureSource;

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

}