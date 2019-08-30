import { Texture, TextureSource } from "./texture";
import { generateUUID } from "../math/uuid";
import { Vector3, Vector4 } from "../math/index";
import { Nullable } from "../type";

export const enum ChannelType {
  diffuse = 'diffuse',
  roughness = 'roughness',
  metallic = 'metallic',
  ao = 'ao'
}

type ChannelName = string;

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
  _channels: Map<ChannelName, Texture> = new Map();

  setChannelColor(channel: ChannelName, color: Vector3) {
    let channelTexture = this._channels.get(channel);
    if (channelTexture === undefined) {
      channelTexture = generateTextureFromPureColor(color);
    } else {
      updateTextureToPureColor(channelTexture, color);
    }
    this.setChannelTexture(channel, channelTexture);
  }

  setChannelTexture(channel: ChannelName, texture: Texture) {
    this._channels.set(channel, texture);
  }

  getChannelTexture(type: ChannelName): Texture {
    const texture = this._channels.get(type);
    if (texture === undefined) {
      throw 'cant get channel texture'
    }
    return texture;
  }

}

function generateTextureFromPureColor(color: Vector3): Texture {
  const R = Math.floor(color.x * 256);
  const G = Math.floor(color.y * 256);
  const B = Math.floor(color.z * 256);
  const A = 256;
  const data = new Uint8ClampedArray([R, G, B, A]);
  const texture = new Texture(TextureSource.fromPixelDataUint8(data, 2, 2));
  return texture;
}

function updateTextureToPureColor(texture: Texture, color: Vector3): Texture {
  return texture;
}