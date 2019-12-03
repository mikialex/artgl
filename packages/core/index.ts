export * from "@artgl/webgl"

export * from "@artgl/math";
export * from "@artgl/shared";

export * from '@artgl/shader-graph';

export * from './src/core/interface'

export * from "./src/core/render-object";
export * from "./src/core/render-source";
export * from "./src/core/render-entity/texture";
export * from "./src/core/render-entity/texture-cube";

export * from "./src/core/render-entity/geometry";
export * from './src/core/render-entity/material';
export * from "./src/core/render-entity/buffer-data";

export * from "./src/core/shading-decorator";
export * from "./src/core/shading";
export * from "./src/core/transformation"

export * from "./src/core/camera";
export { PerspectiveCamera } from "./src/camera/perspective-camera";

export * from './src/core/light'
export * from './src/light/exports';

export * from './src/util/file-io'


import { PassGraphNode } from '@artgl/render-graph';
import { QuadSourceInstance } from "./src/core/render-source";
import { Texture } from "./src/core/render-entity/texture";
import { CubeTexture } from "./src/core/render-entity/texture-cube";
import { texture, cubeTexture } from "@artgl/shader-graph";
export { NormalShading } from "./src/built-in-lib/normal";
PassGraphNode.QuadRenderMethods = QuadSourceInstance.render

export function textureFromValue(textureName:string, value: GLTextureData){
  if (value instanceof Texture) {
    return texture(textureName);
  } else if (value instanceof CubeTexture) {
    return cubeTexture(textureName);
  }  else {
    throw "unsupported uniform value"
  }
}

export type GLTextureData = Texture | CubeTexture;

export { RenderEngine } from "./src/core/render-engine";
export * from './src/core/raycaster'
export { Framer } from "./src/core/framer";