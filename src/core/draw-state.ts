import {
  DepthFunction, BlendingMode, CullSide,
  BlendEquation, SrcAlphaFactor, OneMinusSrcAlphaFactor
} from "../webgl/const";
import { GLRenderer } from "../webgl/gl-renderer";


export class DrawState {
  blending = BlendingMode.NormalBlending;
  cullSide = CullSide.CullFaceBack;

  transparent = false;

  blendSrc = SrcAlphaFactor;
  blendDst = OneMinusSrcAlphaFactor;
  blendEquation = BlendEquation.FUNC_ADD;
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

  syncGL(renderer: GLRenderer) {
    // renderer.state.
    // TODO
  }
}