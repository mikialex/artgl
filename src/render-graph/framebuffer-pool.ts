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

    // when resize, clear all for convenience, TODO, optimize
    // maybe we can mark fbo size dynamic, update(resize) dynamic first
    this.engine.resizeObservable.add(() => {
      this.clearAll();
    })
  }

  private engine: RenderEngine;

  framebuffers: Map<FBOGeneratedName, GLFramebuffer> = new Map();

  availableBuffers: Map<formatKey, GLFramebuffer[]> = new Map();

  clearAll() {
    this.framebuffers.forEach(buffer => {
      this.engine.renderer.framebufferManager.deleteFramebuffer(buffer)
    })
    this.framebuffers.clear();
    this.availableBuffers.clear();
  }

  /**
   * get a GLFramebuffer from pool, if there is no fbo meet the config, create a new one, and pool it
   */
  requestFramebuffer(node: RenderTargetNode) {
    const pooled = this.availableBuffers.get(node.formatKey);
    if (pooled !== undefined) {
      const result = pooled.pop();
      if (pooled.length === 0) {
        this.availableBuffers.delete(node.formatKey);
      }
      return result;
    }
    
    const FBOName = generateUUID();
    const newFBO = this.engine.renderer.framebufferManager.createFrameBuffer(
      this.engine, FBOName, node.widthAbs, node.heightAbs, node.enableDepth);
    
    this.framebuffers.set(FBOName, newFBO);

    return newFBO;
  }

  /**
   * return a framebuffer that maybe request before, which will be pooling and reused 
   */
  returnFramebuffer(framebuffer: GLFramebuffer) {
    if (!this.framebuffers.has(framebuffer.name)) {
      throw 'cant return a framebuffer not belong to this pool'
    }

    let poolList = this.availableBuffers.get(framebuffer._formatKey);
    if (poolList === undefined) {
      poolList = [];
      this.availableBuffers.set(framebuffer._formatKey, poolList);
    }
    poolList.push(framebuffer)
  }

}