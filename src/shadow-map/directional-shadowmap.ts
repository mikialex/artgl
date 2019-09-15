import { DirectionalLight } from "../light/exports";
import { OrthographicCamera } from "../camera/orthographic-camera";
import { generateUUID } from "../math/uuid";
import { Matrix4 } from "../math";
import { ShaderUniformProvider } from "../artgl";

export class ShadowMap implements ShaderUniformProvider {

  hasAnyUniformChanged: boolean = true;
  uniforms: Map<string, any> = new Map();
  propertyUniformNameMap: Map<string, string> = new Map();

}

export class DirectionalShadowMap extends ShadowMap {
  constructor(light: DirectionalLight) {
    super();
    this.light = light;
  }

  updateShadowMatrix() {
    this.shadowCamera.transform.copy(this.light.transform);

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