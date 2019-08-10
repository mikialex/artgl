import { GLFramebuffer } from "../webgl/gl-framebuffer";
import { RenderEngine } from "../engine/render-engine";
import { generateUUID } from "../math";
import { RenderTargetNode } from "./node/render-target-node";

type formatKey = string;
type FBOGeneratedName = string;

/**
 * Proxy the fbo storage in rendergraph
 */
export class FrameBufferPool {
  constructor(engine: RenderEngine) {
    this.engine = engine;
  }

  private engine: RenderEngine;

  framebuffers: Map<FBOGeneratedName, GLFramebuffer>

  availableBuffers: Map<formatKey, GLFramebuffer> = new Map();

  contentKeepBuffers: Set<GLFramebuffer> = new Set();


  /**
   * get a GLFramebuffer from pool, if there is no fbo meet the config, create a new one, and pool it
   */
  requestFramebuffer(node: RenderTargetNode) {
    const pooled = this.availableBuffers.get(node.formatKey);
    if (pooled !== undefined) {
      return pooled;
    }
    const FBOName = generateUUID();
    const newFBO = this.engine.renderer.framebufferManager.createFrameBuffer(
      this.engine, FBOName, width, height, needDepth);
    return newFBO;
  }

  /**
   * return a framebuffer that maybe request before, which will be pooling and reused 
   */
  returnFramebuffer(framebuffer: GLFramebuffer) {
    if (needKeep) {
      this.contentKeepBuffers.add(framebuffer)
    } else {
      this.availableBuffers.set(framebuffer._formatKey, framebuffer);
    }
  }

  /**
    * notify this fbo is not need to be keep, if input fbo has pooled before
    */
  discardFramebuffer(node: RenderTargetNode) {
    this.availableBuffers.delete(framebuffer._formatKey);

  }


}