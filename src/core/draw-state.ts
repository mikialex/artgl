import { DepthFunction, BlendingMode, CullSide, BlendEquation, SrcAlphaFactor, OneMinusSrcAlphaFactor } from "../webgl/const";


export class DrawState {
  blending = BlendingMode.NormalBlending;
  cullSide = CullSide.CullFaceBack;

  opacity = 1;
  transparent = false;

  blendSrc = SrcAlphaFactor;
  blendDst = OneMinusSrcAlphaFactor;
  blendEquation = BlendEquation.AddEquation;
  blendSrcAlpha = null;
  blendDstAlpha = null;
  blendEquationAlpha = null;

  depthFunc = DepthFunction.LessEqualDepth;
  depthTest = true;
  depthWrite = true;

  clippingPlanes = null;
  clipIntersection = false;
  clipShadows = false;

  colorWrite = true;

  polygonOffset = false;
  polygonOffsetFactor = 0;
  polygonOffsetUnits = 0;

  dithering = false;

  alphaTest = 0;
  premultipliedAlpha = false;

  needsUpdate = true;
}