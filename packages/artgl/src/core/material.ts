import { Texture } from "./texture";
import { Vector3, generateUUID } from "@artgl/math"
import { ChannelType } from '@artgl/shader-graph';
import { TextureSource } from "@artgl/shared";

// class Channel {
//   texture: Nullable<Texture> = null
//   isPureColor: boolean = true
//   color: Vector4 = new Vector4()
//   textureNeedUpdate: boolean = true

//   update() {
//     const R = Math.floor(this.color.x * 256);
//     const G = Math.floor(this.color.y * 256);
//     const B = Math.floor(this.color.z * 256);
//     const A = 256;
//     const data = new Uint8ClampedArray([R, G, B, A]);
//     this.texture
//     this.texture = new Texture(TextureSource.fromPixelDataUint8(data, 2, 2));
//   }
// }

/**
 * Material is collection of textures
 * contains bitmap render data
 * @export
 * @class Material
 */
export class Material {
  name: string = "unnamed"

  uuid = generateUUID();
  _channels: Map<ChannelType, Texture> = new Map();

  channel(channel: ChannelType, value: Vector3 | Texture) {
    if (value instanceof Vector3) {
      this.setChannelColor(channel, value);
    } else {
      this.setChannelTexture(channel, value);
    }
    return this;
  }

  setChannelColor(channel: ChannelType, color: Vector3) {
    let channelTexture = this._channels.get(channel);
    if (channelTexture === undefined) {
      channelTexture = generateTextureFromPureColor(color);
    } else {
      updateTextureToPureColor(channelTexture, color);
    }
    this.setChannelTexture(channel, channelTexture);
    return this;
  }

  setChannelTexture(channel: ChannelType, texture: Texture) {
    this._channels.set(channel, texture);
    return this;
  }

  getChannelTexture(type: ChannelType): Texture {
    const texture = this._channels.get(type);
    if (texture === undefined) {
      throw 'cant get channel texture'
    }
    return texture;
  }

  deleteChannel(ChannelType: string) {
    this._channels.delete(ChannelType);
  }

}

function generateTextureFromPureColor(color: Vector3): Texture {
  const R = Math.floor(color.x * 256);
  const G = Math.floor(color.y * 256);
  const B = Math.floor(color.z * 256);
  const A = 256;
  const data = new Uint8ClampedArray([R, G, B, A, R, G, B, A, R, G, B, A, R, G, B, A]);
  const texture = new Texture(TextureSource.fromPixelDataUint8(data, 2, 2));
  texture.isDataTexture = true;
  return texture;
}

function updateTextureToPureColor(texture: Texture, color: Vector3): Texture {
  return texture;
}