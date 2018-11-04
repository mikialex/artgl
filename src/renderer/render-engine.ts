import { GLRenderer } from "./webgl-renderer";
import { RenderList } from "./render-list";
import { RenderObject } from "../core/render-object";
import { Camera } from "../core/camera";
import { Matrix4 } from "../math";
import { GLProgram } from "../webgl/program";
import { Geometry } from "../core/geometry";
import { BufferData } from "../core/buffer-data";
import { Material } from "../core/material";

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
    camera.updateProjectionMatrix();
    this.VPMatrix.multiplyMatrices(camera.projectionMatrix, this.activeCameraMatrixRerverse);
    this.activeCamera = camera;
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

    // prepare material
    const material = object.material;
    const program = material.getProgram(this);
    this.renderer.useProgram(program);
    program.setUniform('worldMatrix', object.matrix);
    program.setUniform('VPMatrix', this.VPMatrix);

    // prepare geometry
    this.connectGeometryData(object.geometry, program);

    // render
    this.renderer.render();
  }

  connectGeometryData(geometry: Geometry, program: GLProgram) {
    for (const infoKey in geometry.layout.dataInfo) {
      const usage = geometry.layout.dataInfo[infoKey].usage;
      if (usage !== undefined) {
        const bufferData = geometry.bufferDatas[infoKey];
        let glBuffer = this.getGLAttributeBuffer(bufferData);
        if (glBuffer === undefined) {
          glBuffer = this.createAttibuteBuffer(bufferData);
        }
        program.getAttributeByUsage(usage).useBuffer(glBuffer);
      }
    }

    program.drawFrom = geometry.layout.drawFrom;
    program.drawCount = geometry.layout.drawCount;

  }

  getProgram(material: Material): GLProgram  {
    const id = material.programId;
    const program = this.renderer.getProgram(id);
    return program;
  }

  createProgram(material: Material): GLProgram  {
    const program = this.renderer.createProgram(material.config.programConfig);
    material.programId = program.id;
    return program;
  }

  getGLAttributeBuffer(bufferData: BufferData): WebGLBuffer {
    return this.renderer.getBuffer(bufferData.storeId);
  }

  createAttibuteBuffer(bufferData: BufferData): WebGLBuffer {
    const id = this.renderer.createBuffer(bufferData.data.buffer);
    bufferData.storeId = id;
    return this.renderer.getBuffer(id);
  }

}