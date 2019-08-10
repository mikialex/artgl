import { GLFramebuffer } from "../webgl/gl-framebuffer";
import { RenderEngine } from "../engine/render-engine";
import { generateUUID } from "../math";

type formatKey = string;

export class FrameBufferPool{
  constructor(engine: RenderEngine) {
    this.engine = engine;
  }

  private engine: RenderEngine;
  availableBuffers: Map<formatKey, GLFramebuffer> = new Map();

  contentKeepBuffers: Set<GLFramebuffer> = new Set();

  locked: boolean = false;

  /**
   * get a GLFramebuffer from pool, if there is no fbo meet the config, create a new one, and pool it
   */
  requestFramebuffer(formatKey: formatKey, width: number, height: number, needDepth: boolean) {
    if (this.locked) {
      throw 'last requested fbo is not returned !'
    }
    const pooled = this.availableBuffers.get(formatKey);
    if (pooled !== undefined) {
      return pooled;
    }
    const FBOName = generateUUID();
    const newFBO = this.engine.renderer.framebufferManager.createFrameBuffer(
      this.engine, FBOName, width, height, needDepth);
    this.locked = true;
    return newFBO;
  }

  /**
  * notify this fbo is not need to be keep, if input fbo has pooled before
  */
  discardFramebuffer(framebuffer: GLFramebuffer) {
    this.availableBuffers.delete(framebuffer._formatKey);

  }


  returnFramebuffer(framebuffer: GLFramebuffer, needKeep: boolean) {
    if (!this.locked) {
      throw 'not fbo request before'
    }
    if (needKeep) {
      this.contentKeepBuffers.add(framebuffer)
    } else {
      this.availableBuffers.set(framebuffer._formatKey, framebuffer);
    }
  }

  markFramebufferNotNeedKeepContent(framebuffer: GLFramebuffer) {
    if (!this.contentKeepBuffers.has(framebuffer)) {
      throw 'this fbo is not content keeping'
    }
    this.contentKeepBuffers.delete(framebuffer);
    this.availableBuffers.set(framebuffer._formatKey, framebuffer);
  }

}