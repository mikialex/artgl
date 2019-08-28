import {
  DepthFunction, BlendingMode, CullSide,
  BlendEquation, SrcAlphaFactor, OneMinusSrcAlphaFactor
} from "../webgl/const";
import { GLRenderer } from "../webgl/gl-renderer";


export class DrawState {
  cullSide = CullSide.CullFaceBack;

  blending = BlendingMode.NormalBlending;
  blendSrc = SrcAlphaFactor;
  blendDst = OneMinusSrcAlphaFactor;
  blendEquation = BlendEquation.FUNC_ADD;
  blendSrcAlpha = null;
  blendDstAlpha = null;
  blendEquationAlpha = null;

  depthFunc = DepthFunction.LessEqualDepth;
  depthTest = true;
  depthWrite = true;

  colorWriteR = true;
  colorWriteG = true;
  colorWriteB = true;
  colorWriteA = true;

  polygonOffset = false;
  polygonOffsetFactor = 0;
  polygonOffsetUnits = 0;

  alphaTest = 0;
  premultipliedAlpha = false;

  syncGL(renderer: GLRenderer) {
    renderer.state.setCullFace(this.cullSide);

    const depthBuffer = renderer.state.depthbuffer;
    depthBuffer.enableTest = this.depthTest
    depthBuffer.setFunc(this.depthFunc)
    depthBuffer.enableWrite = this.depthWrite;

    const colorBuffer = renderer.state.colorbuffer;
    colorBuffer.setColorMask(
      this.colorWriteR, this.colorWriteG,
      this.colorWriteB, this.colorWriteA,
    );

    renderer.state.setPolygonOffset(
      this.polygonOffset,
      this.polygonOffsetFactor,
      this.polygonOffsetUnits
    )

    // TODO blending staff
  }
}