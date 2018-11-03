import { GLRenderer } from "./webgl-renderer";
import { RenderList } from "./render-list";
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
      const obj = opaqueList[i];
      this.renderObject(obj);
    }

    for (let i = 0; i < transparentList.length; i++) {
      const obj = transparentList[i];
      this.renderObject(obj);
    }

  }

  renderObjects(objects: RenderObject[]) {
    
  }

  renderObject(object: RenderObject) {
    const material = object.material;
    const program = material.getProgram(this.renderer);
    program.setUniform('worldMatrix', object.matrix);
    program.setUniform('MVPMatrix', this.MVPMatrix);
    this.connectGeometryData(object.geometry, program);
    this.renderer.useProgram(program);
    this.renderer.render();
  }

  connectGeometryData(geometry: Geometry, program: GLProgram) {
    for (const infoKey in geometry.layout.dataInfo) {
      const usage = geometry.layout.dataInfo[infoKey].usage;
      if (usage !== undefined) {
        program.getAttributeByUsage(usage).updateData(geometry.bufferDatas[infoKey]);
      }
    }

  }

}