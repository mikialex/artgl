
export * from "@artgl/webgl"
export * from "@artgl/math";
export * from "@artgl/shared";
export * from '@artgl/render-graph';
export * from '@artgl/shader-graph';

import { PassGraphNode } from '@artgl/render-graph';
import { QuadSourceInstance } from "./engine/render-source";
import { Texture, CubeTexture, ArrayFlattenable, texture, cubeTexture, uniform } from "..";
import { valueToGLType } from "./core/data-type";
PassGraphNode.QuadRenderMethods = QuadSourceInstance.render

// artgl engine layer
export { RenderEngine } from "./engine/render-engine";
export { Framer } from "./engine/framer";

export * from "./core/render-object";
export * from "@artgl/shared/src/texture-source";
export * from "./core/texture";
export * from "./core/texture-cube";
export { Mesh } from "./object/mesh";
export { Line } from "./object/line";
export { Points } from "./object/points";

export { Geometry } from "./core/geometry";
export * from './core/material';
export * from "./core/shading";
export { BufferData } from "./core/buffer-data";
export { Camera } from "./core/camera";
export * from "@artgl/shared/src/observable";

// scene
export { Scene } from "./scene/scene";
export { SceneNode } from "./scene/scene-node";
export { Transformation } from "./scene/transformation";

// shading lib
export * from './shading/basic-lib/exports';
export * from './shading/pass-lib/exports';

export * from './light/exports';

// geometry lib
export { SphereGeometry } from "./geometry/geo-lib/sphere-geometry";
export { PlaneGeometry } from "./geometry/geo-lib/plane-geometry";
export { CubeGeometry } from "./geometry/geo-lib/cube-geometry";
export { TorusKnotGeometry } from "./geometry/geo-lib/torus-knot-geometry"

// technique lib
export { NormalShading } from "./shading/basic-lib/normal";

// camera
export { PerspectiveCamera } from "./camera/perspective-camera";

//interaction
export { Interactor } from "./interact/interactor";
export { OrbitController } from "./interact/orbit-controller";

//loader
export { OBJLoader } from './loader/obj-loader';

export function textureFromValue(textureName:string, value: Texture | CubeTexture){
  if (value instanceof Texture) {
    return texture(textureName);
  } else if (value instanceof CubeTexture) {
    return cubeTexture(textureName);
  }  else {
    throw "unsupported uniform value"
  }
}

export function uniformFromValue(name: string, value: ArrayFlattenable | number) {
  return uniform(name, valueToGLType(value)).default(value);
}