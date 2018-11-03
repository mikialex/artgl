import { generateUUID } from "../math";
import { GLProgramConfig, GLProgram } from "../webgl/program";
import { GLDataType } from "../webgl/shader-util";
import { GLRenderer } from "../renderer/webgl-renderer";
import { AttributeUsage } from "../webgl/attribute";

export const standradMeshAttributeLayout = [
  { name:'position',type:GLDataType.floatVec3, usage: AttributeUsage.position, stride: 3 },
  { name: 'normal', type: GLDataType.floatVec3, usage: AttributeUsage.normal, stride: 3 },
  { name: 'uv', type: GLDataType.floatVec2, usage: AttributeUsage.uv, stride: 2 },
]

export interface MaterialConfig{
  programConfig: GLProgramConfig;
}

export class Material{
  constructor() {
  }

  config;
  name: string;
  uuid = generateUUID();

  needUpdate = true;
  isTransparent = false;

  createProgram(renderer: GLRenderer): GLProgram {
    throw 'material not implemented';
  }

  getProgram(renderer: GLRenderer) {
    if (this.needUpdate) {
      this.createProgram(renderer);
    }
    return renderer.getProgram(this);
  }

  dispose(renderer: GLRenderer) {
    const program = this.getProgram(renderer);
    if (program) {
      program.dispose();
    }
  }

  // fog = true;
  // lights = true;

  // blending = NormalBlending;
  // side = FrontSide;
  // shading = SmoothShading; // THREE.FlatShading, THREE.SmoothShading
  // vertexColors = NoColors; // THREE.NoColors, THREE.VertexColors, THREE.FaceColors

  // opacity = 1;
  // transparent = false;

  // blendSrc = SrcAlphaFactor;
  // blendDst = OneMinusSrcAlphaFactor;
  // blendEquation = AddEquation;
  // blendSrcAlpha = null;
  // blendDstAlpha = null;
  // blendEquationAlpha = null;

  // depthFunc = LessEqualDepth;
  // depthTest = true;
  // depthWrite = true;

  // clippingPlanes = null;
  // clipIntersection = false;
  // clipShadows = false;

  // colorWrite = true;

  // polygonOffset = false;
  // polygonOffsetFactor = 0;
  // polygonOffsetUnits = 0;

  // dithering = false;

  // alphaTest = 0;
  // premultipliedAlpha = false;

  // needsUpdate = true;

}