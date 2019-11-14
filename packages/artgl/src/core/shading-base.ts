import { Observable } from "./observable";
import {
  ShaderUniformProvider, ShaderUniformDecorator, getPropertyUniform, ProviderUploadCache, getPropertyTexture
} from "./shading";
import { ShaderGraph } from "../shader-graph/shader-graph";
import { ShaderUniformInputNode, ShaderTextureNode } from "../shader-graph/shader-node";

export abstract class BaseEffectShading<T>
  implements ShaderUniformProvider, ShaderUniformDecorator {
  
  getBlockedBuffer(): Float32Array {
    return this.uploadCache.blockedBuffer!;
  }
  getBlockedBufferVersion(): number {
    return this.uploadCache._version;
  }

  shouldProxyedByUBO = true;
  abstract decorate(graph: ShaderGraph): void;

  foreachProvider(visitor: (p: ShaderUniformProvider) => any) {
    return visitor(this);
  }

  notifyNeedRedecorate: Observable<ShaderUniformDecorator> = new Observable();
  uploadCache!: ProviderUploadCache

  nodeCreated: Map<string, ShaderUniformInputNode> = new Map();
  textureNodeCreated: Map<string, ShaderTextureNode> = new Map();

  getPropertyUniform(name: keyof T): ShaderUniformInputNode {
    return getPropertyUniform(this, name)
  }

  getPropertyTexture(name: keyof T): ShaderTextureNode {
    return getPropertyTexture(this, name);
  }

}
