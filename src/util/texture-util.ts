import { MathUtil } from "../math";
import { TextureSource } from "../core/texture-source";

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

    const width = MathUtil.floorPowerOfTwo(scale * source.width);
    const height = MathUtil.floorPowerOfTwo(scale * source.height);

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
