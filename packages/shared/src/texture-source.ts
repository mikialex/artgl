import { Nullable } from "..";

function isPowerOfTwo(value: number) {
  return (value & (value - 1)) === 0 && value !== 0;
}

function floorPowerOfTwo(value: number) {
  return Math.pow(2, Math.floor(Math.log(value) / Math.LN2));
}

/**
 * Container for texture data storage, not only data self,
 * but also some meta info like width height, because data texture need this
 */
export class TextureSource {

  // use getter is avoid break ci test
  static _utilCanvas: HTMLCanvasElement
  static get utilCanvas() {
    if (TextureSource._utilCanvas === undefined) {
      TextureSource._utilCanvas = document.createElement('canvas');
    }
    return TextureSource._utilCanvas
  }

  static WEBGL_LARGEST_TEXTURE_SIZE = 4096

  static fromImageElement(image: HTMLImageElement) {
    const data = new TextureSource();
    data.source = image;
    data.width = image.width;
    data.height = image.height;
    data.updateIsPOT();
    return data;
  }

  static async fromUrl(url: string) {
    const img = await new Promise<HTMLImageElement>((re, rj) => {
      const image = document.createElement('img');
      image.crossOrigin = "*"
      image.src = url;
      image.onload = () => {
        re(image)
      }
      image.onerror = (err) => {
        rj(err)
      }
    })
    return TextureSource.fromImageElement(img);
  }

  static fromPixelDataUint8(buffer: Uint8ClampedArray, width: number, height: number) {
    const data = new TextureSource();
    data.source = buffer;
    data.width = width;
    data.height = height;
    data.updateIsPOT();
    return data;
  }

  static forRenderTarget(width: number, height: number) {
    const data = new TextureSource();
    data.source = null;
    data.width = width;
    data.height = height;
    data.updateIsPOT();
    return data;
  }

  // null source is use to create fbo attached texture
  source: Nullable<TexImageSource | ArrayBufferView> = null
  width: number = 1;
  height: number = 1;
  isPOT: boolean = false;
  updateIsPOT() {
    this.isPOT = isPowerOfTwo(this.width) && isPowerOfTwo(this.height);
  }

  get isSizeDimensionValid() {
    return this.width < TextureSource.WEBGL_LARGEST_TEXTURE_SIZE &&
      this.height < TextureSource.WEBGL_LARGEST_TEXTURE_SIZE
  }

  // two consideration: POT, size too large
  // todo maybe need cache
  isValid(needPOT: boolean): boolean {
    if (needPOT) {
      return this.isSizeDimensionValid && this.isPOT
    } else {
      return this.isSizeDimensionValid
    }
  }

  createPOTTextureSource(needPOT: boolean) {
    return resizeImageFORWebGL(this, needPOT, TextureSource.utilCanvas, 4096)
  }

}

export function resizeImageFORWebGL(
  source: TextureSource,
  needsPowerOfTwo: boolean,
  utilCanvas: HTMLCanvasElement,
  maxSize: number) {

  if (source.source === null) {
    return source;
  }

  let scale = 1;

  // handle case if texture exceeds max size
  if (source.width > maxSize || source.height > maxSize) {
    scale = maxSize / Math.max(source.width, source.height);
  }

  // only perform resize if necessary
  if (scale < 1 || needsPowerOfTwo) {

    const width = floorPowerOfTwo(scale * source.width);
    const height = floorPowerOfTwo(scale * source.height);

    utilCanvas.width = width;
    utilCanvas.height = height;

    var context = utilCanvas.getContext('2d')!;
    context.drawImage(source.source as any, 0, 0, width, height);

    console.warn(`Texture has been resized from (${source.width}, ${source.height}) to (${width}, ${height}).`);

    const resizedData = context.getImageData(0, 0, width, height);

    const newSource = new TextureSource()
    newSource.source = resizedData;
    newSource.width = width;
    newSource.height = height;
    newSource.updateIsPOT();
    return newSource;

  }

  return source;

}
