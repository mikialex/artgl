import { GLRenderer } from "./webgl-renderer";
import { RenderList } from "./render-list";
import { LightList } from "./light-list";
import { RenderObject } from "../core/render-object";
import { Camera } from "../core/camera";
import { Matrix4 } from "../math";
import { GLProgram } from "../webgl/program";
import { Geometry } from "../core/geometry";

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
  lightList: LightList = new LightList();
  activeCamera: Camera;
  activeCameraMatrixRerverse = new Matrix4();
  MVPMatrix = new Matrix4();

  adaptor: ARTEngineAdaptor;

  useAdaptor(adaptor: ARTEngineAdaptor) {
    this.adaptor = adaptor;
  }

  setCamera(camera: Camera, matrix: Matrix4) {
    this.activeCameraMatrixRerverse.getInverse(matrix, true);
    camera.updateProjectionMatrix();
    this.MVPMatrix.multiplyMatrices(camera.projectionMatrix, this.activeCameraMatrixRerverse);
    this.activeCamera = camera;
  }

  // render renderList
  render() {
    const opaqueList = this.renderList.opaqueList;
    const transparentList = this.renderList.transparentList;
    for (let i = 0; i < opaqueList.length; i++) {
      const renderCall = opaqueList[i];
      this.renderObject(renderCall.object, renderCall.matrix);
    }

    for (let i = 0; i < transparentList.length; i++) {
      const renderCall = transparentList[i];
      this.renderObject(renderCall.object, renderCall.matrix);
    }

  }

  renderObject(object: RenderObject, matrix:Matrix4) {
    const material = object.material;
    material.createProgram(this.renderer);
    const program = material.program;
    program.setUniform('worldMatrix', matrix);
    program.setUniform('MVPMatrix', this.MVPMatrix);
    this.connectGeometryData(object.geometry, program);
    this.renderer.useProgram(program);
    this.renderer.render();
  }

  connectGeometryData(geometry: Geometry, program: GLProgram) {
    for (const infoKey in geometry.layout.dataInfo) {
      const info = geometry.layout.dataInfo[infoKey];
      program.getAttributeByUsage(info.usage).updateData(geometry.bufferDatas[infoKey]);
    }

  }

}