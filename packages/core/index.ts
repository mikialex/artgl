export * from "@artgl/webgl"

export * from "@artgl/math";
export * from "@artgl/shared";

export * from '@artgl/render-graph';
export * from '@artgl/shader-graph';

import { PassGraphNode } from '@artgl/render-graph';
import { QuadSourceInstance } from "./src/core/render-source";
import { Texture, CubeTexture, texture, cubeTexture } from "..";
PassGraphNode.QuadRenderMethods = QuadSourceInstance.render

// artgl engine layer
export { RenderEngine } from "./src/core/render-engine";
export { Framer } from "./src/engine/framer";

export * from "./src/scene-graph/object/render-object";
export * from "./src/core/render-entity/texture";
export * from "./src/core/render-entity/texture-cube";
export { Mesh } from "./src/scene-graph/object/mesh";
export { Line } from "./src/scene-graph/object/line";
export { Points } from "./src/scene-graph/object/points";

export * from "./src/core/render-entity/geometry";
export * from './src/core/render-entity/material';
export * from "./src/core/shading";
export * from "./src/core/render-entity/buffer-data";
export * from "./src/core/camera";

export * from "./src/core/shading-decorator";
// scene
export { Scene } from "./src/scene-graph/scene";
export { SceneNode } from "./src/scene-graph/scene-node";
export { Transformation } from "./src/scene-graph/transformation";


export * from './src/light/exports';

// camera
export { PerspectiveCamera } from "./src/camera/perspective-camera";

//interaction
export { Interactor } from "./src/interact/interactor";
export { OrbitController } from "./src/interact/orbit-controller";

//loader
export { OBJLoader } from './src/loader/obj-loader';

export function textureFromValue(textureName:string, value: Texture | CubeTexture){
  if (value instanceof Texture) {
    return texture(textureName);
  } else if (value instanceof CubeTexture) {
    return cubeTexture(textureName);
  }  else {
    throw "unsupported uniform value"
  }
}

export type GLTextureData = Texture | CubeTexture;