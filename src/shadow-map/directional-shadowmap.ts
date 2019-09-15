import { DirectionalLight } from "../light/exports";
import { OrthographicCamera } from "../camera/orthographic-camera";
import { generateUUID } from "../math/uuid";
import { Matrix4 } from "../math";

export class DirectionalShadowMap {
  constructor(light: DirectionalLight) {
    this.light = light;
  }

  updateShadowMatrix() {
    this.shadowCamera.transform.copy(this.light.transform);
    // lightPositionWorld.setFromMatrixPosition( light.matrixWorld );
    // shadowCamera.position.copy( lightPositionWorld );

    // lookTarget.setFromMatrixPosition( light.target.matrixWorld );
    // shadowCamera.lookAt( lookTarget );
    // shadowCamera.updateMatrixWorld();

    // projScreenMatrix.multiplyMatrices( shadowCamera.projectionMatrix, shadowCamera.matrixWorldInverse );
    // this._frustum.setFromMatrix( projScreenMatrix );

    this.shadowMatrix.set(
    	0.5, 0.0, 0.0, 0.5,
    	0.0, 0.5, 0.0, 0.5,
    	0.0, 0.0, 0.5, 0.5,
    	0.0, 0.0, 0.0, 1.0
    );

    this.shadowMatrix.multiply(this.shadowCamera.projectionMatrix);
    this.shadowMatrix.multiply(this.shadowCamera.transform.inverseMatrix);
  }

  private light: DirectionalLight
  private shadowCamera: OrthographicCamera = new OrthographicCamera();
  private shadowMatrix: Matrix4 = new Matrix4();

  private mapFBOKey: string = generateUUID();

}