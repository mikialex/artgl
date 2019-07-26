import { SceneNode } from "../scene/scene-node";
import { Matrix4 } from "../math/index";
import { RenderEngine, Size } from '../engine/render-engine';
import { Observer } from './observable';
import { Nullable } from '../type';
import { ShaderUniformProvider } from "./shading";
import { ShaderGraph } from "../shader-graph/shader-graph";
import { UniformProxy } from "../engine/uniform-proxy";

/**
 * Camera is abstraction of a params set to a projection matrix.
 * extender can support more useful interface
 * to make the projection relation more easy to 
 * understand and modified;
 * 
 * @export
 * @class Camera
 * @extends {SceneNode}
 */
export class Camera extends SceneNode implements ShaderUniformProvider {
  constructor() {
    super();
  }

  projectionMatrix = new Matrix4();
  projectionMatrixNeedUpdate = false;
  updateProjectionMatrix() { };
  onRenderResize(newSize: Size) {
    
  }

  hasAnyUniformChanged: boolean = false;

  decorate(graph: ShaderGraph): void {
    throw new Error("Method not implemented.");
  }

  uniforms: Map<string, UniformProxy> = new Map();

  private renderSizeObserver: Nullable<Observer<Size>> = null;
  bindEngineRenderSize(engine: RenderEngine) {
    if (this.renderSizeObserver !== null) {
      engine.resizeObservable.remove(this.renderSizeObserver);
    }
    this.renderSizeObserver = engine.resizeObservable.add(this.onRenderResize);
  }
  

}