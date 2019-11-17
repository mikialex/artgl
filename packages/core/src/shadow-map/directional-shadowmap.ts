import { DirectionalLight } from "../light/exports";
import { OrthographicCamera } from "../camera/orthographic-camera";
import { Matrix4 } from "@artgl/math";
import { BaseEffectShading } from "../core/shading";
import { ShadingUniform, ShadingComponent } from "../core/shading-decorator";
import { ShaderFunction, ShaderGraph, WorldPositionFragVary, texture } from "@artgl/shader-graph";
import { unPackDepth } from "@artgl/shader-graph/src/built-in/depth-pack";

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
      vec4 worldInShadowCameraNDC = vec4(worldPosition, 1.0) * shadowMatrix;
      worldInShadowCameraNDC = worldInShadowCameraNDC / worldInShadowCameraNDC.w;
      float worldDepth = worldInShadowCameraNDC.z;
      float depthInShadowCamera = UnpackDepth(texture2D(shadowMap, worldInShadowCameraNDC.xy));
      if(depthInShadowCamera < worldDepth){
        return vec4(inputColor.rgb * 0.5, 1.0);
      }else{
        return inputColor;
      }
  }
  `,
  dependFunction: [unPackDepth]
})

@ShadingComponent()
export class DirectionalShadowMap extends ShadowMap<DirectionalShadowMap> {
  constructor(light: DirectionalLight) {
    super();
    this.light = light;
  }

  updateShadowMatrix() {
    // this.shadowCamera.transform.copy(this.light.transform); todo
    // this.shadowCamera.transform.position.set(0, 0, 100);

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

  getShadowCamera(): Readonly<OrthographicCamera> {
    return this.shadowCamera;
  }

  @ShadingUniform('directionalShadowMapMatrix')
  shadowMatrix: Matrix4 = new Matrix4();

  decorate(graph: ShaderGraph): void {
    graph.setFragmentRoot(
      addShadow.make()
      .input('worldPosition', graph.getVary(WorldPositionFragVary))
      .input('shadowMap', texture("directionalShadowMapTexture"))
      .input('shadowMatrix', this.getPropertyUniform('shadowMatrix'))
      .input('inputColor', graph.getFragRoot())
    )
  }

}