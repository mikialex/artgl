import { GLRenderer } from "../webgl/webgl-renderer";
import { RenderList } from "./render-list";
import { RenderObject } from "../core/render-object";
import { Camera } from "../core/camera";
import { Matrix4 } from "../math/matrix4";
import { GLProgram } from "../webgl/program";
import { Geometry } from "../core/geometry";
import { BufferData } from "../core/buffer-data";
import { Technique } from "../core/technique";
import { AttributeUsage } from "../webgl/attribute";
import { DrawMode } from "../webgl/const";
import { Texture } from "../core/texture";
import { GLFramebuffer } from "../webgl/gl-framebuffer";

export class ARTEngineAdaptor {
  constructor(engine: ARTEngine) {
    this.engine = engine;
  }
  engine: ARTEngine;

  update() {
    
  }
}

export class ARTEngine {
  constructor(renderer: GLRenderer) {
    this.renderer = renderer;
  }

  renderer: GLRenderer;

  renderList: RenderList = new RenderList();
  
  activeCamera: Camera;
  activeCameraMatrixRerverse = new Matrix4();
  VPMatrix = new Matrix4();

  adaptor: ARTEngineAdaptor;

  useAdaptor(adaptor: ARTEngineAdaptor) {
    this.adaptor = adaptor;
  }

  updateViewProjection(camera: Camera) {
    this.activeCameraMatrixRerverse.getInverse(camera.worldMatrix, true);
    camera.updateProjectionMatrix(); // TODO projectmatrix may not need update
    this.VPMatrix.multiplyMatrices(camera.projectionMatrix, this.activeCameraMatrixRerverse);
    this.activeCamera = camera;
  }

  setRenderTarget(target: GLFramebuffer) {
    
  }

  // render renderList
  render() {
    const opaqueList = this.renderList.opaqueList;
    const transparentList = this.renderList.transparentList;
    for (let i = 0; i < opaqueList.length; i++) {
      const obj = opaqueList[i];
      this.renderObject(obj);
    }

    for (let i = 0; i < transparentList.length; i++) {
      const obj = transparentList[i];
      this.renderObject(obj);
    }

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
    this.renderer.useProgram(program);
    program.setUniform('MMatrix', object.worldMatrix);
    program.setUniform('VPMatrix', this.VPMatrix);

    // prepare geometry
    this.connectGeometryData(object.geometry, program);

    // render
    this.renderer.render(DrawMode.TRIANGLES, program.useIndexDraw);
  }

  connectGeometryData(geometry: Geometry, program: GLProgram) {
    let indexBuffer;
    for (const infoKey in geometry.layout.dataInfo) {
      const usage = geometry.layout.dataInfo[infoKey].usage;
      if (usage !== undefined && usage !== AttributeUsage.index) {
        const bufferData = geometry.bufferDatas[infoKey];
        let glBuffer = this.getGLAttributeBuffer(bufferData);
        if (glBuffer === undefined) {
          glBuffer = this.createOrUpdateAttributeBuffer(bufferData, false);
        }
        const attribute = program.getAttributeByUsage(usage);
        if (attribute !== undefined) { // some buffer may not need to be used by shader
          attribute.useBuffer(glBuffer);
        }
      }

      if (usage === AttributeUsage.index) {
        if (indexBuffer !== undefined) {
          throw 'geometry only can set one index buffer';
        }
        indexBuffer = geometry.bufferDatas[infoKey];
      }
    }

    if (indexBuffer !== undefined && geometry.layout.indexDraw) {
      program.useIndexDraw = true;
      let glIndexBuffer = this.getGLAttributeBuffer(indexBuffer);
      if (glIndexBuffer === undefined) {
        glIndexBuffer = this.createOrUpdateAttributeBuffer(indexBuffer, true);
      }
      program.useIndexBuffer(glIndexBuffer);
    } else {
      program.useIndexDraw = false;
    }

    program.drawFrom = geometry.layout.drawFrom;
    program.drawCount = geometry.layout.drawCount;

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

}