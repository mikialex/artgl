import { DirectionalLight } from "../light/exports";
import { OrthographicCamera } from "../camera/orthographic-camera";
import { generateUUID } from "../math/uuid";
import { Matrix4 } from "../math";
import { BaseEffectShading, MapUniform } from "../core/shading";
import { ShaderFunction } from "../shader-graph/shader-function";
import { ShaderGraph, WorldPositionFragVary } from "../artgl";
import { Texture } from "../core/texture";

export abstract class ShadowMap<T> extends BaseEffectShading<T> {


}

const addShadow = new ShaderFunction({
  source: `
  vec4 addShadow(
    vec3 worldPosition,
    sampler2D shadowMap, 
    mat4 shadowMatrix,
    vec4 inputColor,
    ){
      return inputColor;
  }
  `
})

export class DirectionalShadowMap extends ShadowMap<DirectionalShadowMap> {
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

  @MapUniform('directionalShadowMapMatrix')
  shadowMatrix: Matrix4 = new Matrix4();

  // private shadowMapTexture: Texture;

  decorate(graph: ShaderGraph): void {
    graph.setFragmentRoot(
      addShadow.make()
      .input('worldPosition', graph.getVary(WorldPositionFragVary))
      // .input('shadowMap', )
      .input('shadowMatrix', this.getPropertyUniform('shadowMatrix'))
      .input('inputColor', graph.getFragRoot())
    )
  }

}