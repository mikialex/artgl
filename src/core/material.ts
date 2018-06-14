import { generateUUID } from "../math";
import { UniformDescriptor } from "../webgl/webgl-program";

const defaultMaterialconfig = {

}

export class Material{
  name: string;
  uuid = generateUUID();

  isTransparent = false;

  params: UniformDescriptor;

  createProgram() {
    
  }

  dispose() {

  }

  // uuid = _Math.generateUUID();

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