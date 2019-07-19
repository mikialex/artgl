import {
  DepthFunction, BlendingMode, CullSide,
  BlendEquation, SrcAlphaFactor, OneMinusSrcAlphaFactor
} from "../webgl/const";


export class DrawState {
  blending = BlendingMode.NormalBlending;
  cullSide = CullSide.CullFaceBack;

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

  colorWrite = true;

  polygonOffset = false;
  polygonOffsetFactor = 0;
  polygonOffsetUnits = 0;

  dithering = false;

  alphaTest = 0;
  premultipliedAlpha = false;

}