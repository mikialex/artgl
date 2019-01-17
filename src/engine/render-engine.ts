import { GLRenderer } from "../webgl/webgl-renderer";
import { RenderList } from "./render-list";
import { RenderObject, RenderRange } from "../core/render-object";
import { Camera } from "../core/camera";
import { Matrix4 } from "../math/matrix4";
import { GLProgram } from "../webgl/program";
import { Geometry } from "../core/geometry";
import { BufferData } from "../core/buffer-data";
import { Technique } from "../core/technique";
import { DrawMode } from "../webgl/const";
import { Texture } from "../core/texture";
import { GLFramebuffer } from "../webgl/gl-framebuffer";
import { Material } from "../core/material";
import { GLTexture } from "../webgl/gl-texture";
import { PerspectiveCamera } from "../camera/perspective-camera";
import { Nullable } from "../type";

export interface RenderSource{
  getRenderList(): RenderList;
}

export class ARTEngine {
  constructor(el?: HTMLCanvasElement, options?: any) {
    this.renderer = new GLRenderer(el, options);
    // if we have a element param, use it as the default camera's param for convienience
    if (el !== undefined) {
      (this.camera as PerspectiveCamera).aspect = el.width / el.height;
    }
  }

  renderer: GLRenderer;
  overrideTechnique: Nullable<Technique> = null;




  //// frame controls
  private userRenderFrame: Nullable<FrameRequestCallback> = null;
  private renderFrame: FrameRequestCallback = (time) => {
    this.frameStart();
    this.userRenderFrame(time);
    this.frameEnd();
    if (this.isAutoRenderActive) {
      window.requestAnimationFrame(this.renderFrame);
    }
  }
  isAutoRenderActive = false;
  setFrame(frame: FrameRequestCallback) {
    this.renderFrame = frame;
  }

  run() {
    if (!this.userRenderFrame) {
      throw 'frame function is not set';
    }
    this.isAutoRenderActive = true;
    window.requestAnimationFrame(this.renderFrame);
  }

  stop() {
    this.isAutoRenderActive = false;
  }

  private frameStart() {
    this.connectCamera();
  }

  private frameEnd() {
    
  }

  ////




  //// camera related
  _camera: Camera = new PerspectiveCamera();
  private isCameraChanged = true;
  get camera() { return this._camera };
  set camera(camera) {
    this._camera = camera;
    this.isCameraChanged = true;
  };
  private cameraMatrixRerverse = new Matrix4();
  private VPMatrix = new Matrix4();
  private needUpdateVP = true;

  connectCamera() {
    // if (this.camera.projectionMatrixNeedUpdate) {
      this.camera.updateProjectionMatrix();
      this.needUpdateVP = true;
    // }
    // todo
    this.camera.updateWorldMatrix(true);
    // if (this.isCameraChanged) { // TODO camera matrix change
      this.cameraMatrixRerverse.getInverse(this.camera.worldMatrix, true);
      this.needUpdateVP = true;
    // }
    // if (this.needUpdateVP) {
      this.VPMatrix.multiplyMatrices(this.camera.projectionMatrix, this.cameraMatrixRerverse);
      this.needUpdateVP = false;
    // }
   
  }
  ////




  //// render APIs
  // render renderList from given source
  render(source: RenderSource) {
    const renderlist = source.getRenderList();
    renderlist.forEach((obj) => {
      this.renderObject(obj);
    })
  }

  renderObjects(objects: RenderObject[]) {
    for (let i = 0; i < objects.length; i++) {
      this.renderObject(objects[i]);
    }
  }

  renderObject(object: RenderObject) {

    // prepare technique
    const technique = object.technique;
    const program = technique.getProgram(this);
    this.connectTechnique(technique, program, object);

    // prepare material
    this.connectMaterial(object.material, program);

    // prepare geometry
    this.connectGeometry(object.geometry, program);

    this.connectRange(object.range, program, object.geometry)

    // render
    this.renderer.render(DrawMode.TRIANGLES, program.useIndexDraw);
  }
  ////




  //// low level resouce binding
  connectTechnique(technique: Technique, program: GLProgram, object: RenderObject) {
    if (this.overrideTechnique !== null) {
      technique = this.overrideTechnique;
      program = this.overrideTechnique.getProgram(this);
    }
    this.renderer.useProgram(program);
    program.setUniform('MMatrix', object.worldMatrix);
    program.setUniform('VPMatrix', this.VPMatrix);
    technique.uniforms.forEach((uni, key) => {
      program.setUniform('key', uni);
    })
  }

  connectMaterial(material: Material, program: GLProgram) {

    program.forTextures((tex: GLTexture) => {
      let webgltexture: WebGLTexture;

      // aquire texuture from material or framebuffers
      if (material !== undefined) {
        const texture = material.getChannelTexture(tex.name);
        if (texture.gltextureId === undefined) {
          texture.gltextureId = this.renderer.textureManger.createTextureFromImageElement(texture.image);
          webgltexture = this.renderer.textureManger.getGLTexture(texture.gltextureId);
        }
      } 

      if (webgltexture === undefined) {
        webgltexture = this.renderer.frambufferManager.getFramebufferTexture(tex.name);
      }

      if (webgltexture === undefined) {
        throw 'texture bind failed'
      }
      
      tex.useTexture(webgltexture);
    })
  }

  connectGeometry(geometry: Geometry, program: GLProgram) {

    program.forAttributes(att => {
      const bufferData = geometry.bufferDatas[att.name];
      let glBuffer = this.getGLAttributeBuffer(bufferData);
      if (glBuffer === undefined) {
        glBuffer = this.createOrUpdateAttributeBuffer(bufferData, false);
      }
      att.useBuffer(glBuffer);
    })

    if (program.useIndexDraw) {
      if (geometry.indexBuffer === null) {
        throw 'indexBuffer not found for index draw'
      }
      let glBuffer = this.getGLAttributeBuffer(geometry.indexBuffer);
      if (glBuffer === undefined) {
        glBuffer = this.createOrUpdateAttributeBuffer(geometry.indexBuffer, true);
      }
      program.useIndexBuffer(glBuffer);
    }
  }

  connectRange(range: RenderRange, program: GLProgram, geometry: Geometry) {
    let start = 0;
    let count = 0;
    if (range === undefined) {
      if (geometry.indexBuffer !== null) {
        count = geometry.indexBuffer.data.length;
      } else {
        throw 'range should be set if use none index geometry'
      }
    }
    program.drawFrom = start;
    program.drawCount = count;
  }

  getGLTexture(texture: Texture): WebGLTexture {
    const id = texture.gltextureId;
    return this.renderer.getGLTexture(id);
  }

  getProgram(technique: Technique): GLProgram {
    const id = technique.programId;
    const program = this.renderer.getProgram(id);
    return program;
  }

  createProgram(technique: Technique): GLProgram  {
    const program = this.renderer.createProgram(technique.config.programConfig);
    technique.programId = program.id;
    technique.needUpdate = false;
    return program;
  }

  getGLAttributeBuffer(bufferData: BufferData): WebGLBuffer {
    return this.renderer.attributeBufferManager.getGLBuffer(bufferData.data.buffer as ArrayBuffer);
  }

  createOrUpdateAttributeBuffer(bufferData: BufferData, useforIndex: boolean): WebGLBuffer {
    return this.renderer.attributeBufferManager.updateOrCreateBuffer(bufferData.data.buffer as ArrayBuffer, useforIndex);
  }


  setRenderTarget(target: GLFramebuffer) {

  }



}