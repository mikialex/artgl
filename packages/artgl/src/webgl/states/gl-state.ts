import { GLRenderer } from "../gl-renderer";
import { Vector4 } from "../../math/vector4";
import { CullSide } from "../const";
import { GLColorBuffer } from "./gl-color-buffer";
import { GLDepthBuffer } from "./gl-depth-buffer";
import { GLTextureSlot } from "./gl-texture-slot";

export class GLState {
  constructor(renderer: GLRenderer) {
    this.renderer = renderer;
    this.gl = renderer.gl;
    this.colorbuffer = new GLColorBuffer(renderer);
    this.depthbuffer = new GLDepthBuffer(renderer);
    this.textureSlot = new GLTextureSlot(renderer);
  }
  readonly renderer: GLRenderer;
  readonly gl: WebGLRenderingContext;
  readonly colorbuffer: GLColorBuffer;
  readonly depthbuffer: GLDepthBuffer;
  readonly textureSlot: GLTextureSlot;

  currentViewport: Vector4 = new Vector4();
  newViewport: Vector4 = new Vector4();
  currentScissor: Vector4 = new Vector4();
  newScissor: Vector4 = new Vector4();

  // specifies the affine transformation of x and y 
  // from normalized device coordinates to window coordinates.
  setViewport(x: number, y: number, width: number, height: number) {
    this.newViewport.set(x, y, width, height);
    if (!this.newViewport.equals(this.currentViewport)) {
      this.gl.viewport(x, y, width, height);
      this.currentViewport.copy(this.newViewport);
    }
  }

  setFullScreenViewPort() {
    this.setViewport(0, 0, this.renderer.width, this.renderer.height);
  }

  setScissor(x: number, y: number, width: number, height: number) {
    this.newScissor.set(x, y, width, height);
    if (!this.newScissor.equals(this.currentScissor)) {
      this.gl.viewport(x, y, width, height);
      this.currentScissor.copy(this.newScissor)
    }
  }

  currentCullFace: CullSide = CullSide.CullFaceNone;
  setCullFace(cullFace: CullSide) {
    const gl = this.gl;
    if (cullFace !== CullSide.CullFaceNone) {
      gl.enable(gl.CULL_FACE);
      if (cullFace !== this.currentCullFace) {
        if (cullFace === CullSide.CullFaceBack) {
          gl.cullFace(gl.BACK);
        } else if (cullFace === CullSide.CullFaceFront) {
          gl.cullFace(gl.FRONT);
        } else {
          gl.cullFace(gl.FRONT_AND_BACK);
        }
      }
    } else {
      gl.disable(gl.CULL_FACE);
    }
    this.currentCullFace = cullFace;
  }

  currentPolygonOffsetFactor: number = 0;
  currentPolygonOffsetUnits: number = 0;

  setPolygonOffset(polygonOffsetEnable: boolean, factor: number, units: number) {
    const gl = this.gl;
    if (polygonOffsetEnable) {
      gl.enable(gl.POLYGON_OFFSET_FILL);
      if (this.currentPolygonOffsetFactor !== factor || this.currentPolygonOffsetUnits !== units) {
        gl.polygonOffset(factor, units);
        this.currentPolygonOffsetFactor = factor;
        this.currentPolygonOffsetUnits = units;
      }
    } else {
      gl.disable(gl.POLYGON_OFFSET_FILL);
    }
  }

}


