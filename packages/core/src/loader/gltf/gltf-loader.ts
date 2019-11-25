import { GLTFParsedData, extractTextureSource, extractData } from "./gltf-util";


export class GLTFLoader{

  load(gltf: string) {
    const gltfData = JSON.parse(gltf);

    const parsedData: GLTFParsedData = {
      textureSource: []
    };

    parsedData.textureSource = extractData(gltfData, parsedData, 'textures', extractTextureSource)


    
  }


}