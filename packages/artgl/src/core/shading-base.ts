import { Observable } from "@artgl/shared";
import { ShaderUniformProvider, ShaderUniformDecorator, ProviderUploadCache } from "./interface";
import {
  ShaderGraph, ShaderUniformInputNode, ShaderTextureNode
} from "@artgl/shader-graph";
import { getPropertyUniform, getPropertyTexture } from "./shading";


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
