import { TextureSource } from "@artgl/shared";

export function logUnsupportedAssetType(typeName: string) {
  console.warn(`unsupportedGLTFAsset: ${typeName}`)
}

export function extractData<T>(
  data: GLTF.IGLTF,
  parsed: GLTFParsedData,
  typeName: keyof GLTF.IGLTF,
  extractor: (data: any, parsed: GLTFParsedData) => T
): T[] {
  const results: T[] = [];
  if (!Array.isArray(data[typeName])) {
    return results;
  }
  data[typeName].forEach((item: any) => {
    results.push(extractor(item, parsed));
  });
  return results;
}

export interface GLTFParsedData {
  textureSource: TextureSource[]
}

export function extractTextureSource(data: GLTF.IImage, parsed: GLTFParsedData): TextureSource {
  // url data
  if (data.uri !== undefined) {
    
  } else { // buffer data
    
  }
}