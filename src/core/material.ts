import { Texture, TextureSource } from "./texture";
import { generateUUID } from "../math/uuid";
import { Vector3 } from "../math/index";

export const enum ChannelType {
  diffuse = 'diffuse',
  roughness = 'roughness',
  metallic = 'metallic',
  ao = 'ao'
}

type ChannelName = string;

/**
 * Material is collection of textures
 * contains bitmap render data
 * @export
 * @class Material
 */
export class Material {

  uuid = generateUUID();
  private channels: Map<ChannelName, Texture> = new Map();

  setChannelColor(channel: ChannelName, color: Vector3) {
    let channelTexture = this.channels.get(channel);
    if (channelTexture === undefined) {
      channelTexture = generateTextureToPureColor(color);
    } else {
      updateTextureToPureColor(channelTexture, color);
    }
  }

  setChannelTexture(channel: ChannelName, texture: Texture) {
    this.channels.set(channel, texture);
  }

  getChannelTexture(type: ChannelName): Texture {
    const texture = this.channels.get(type);
    if (texture === undefined) {
      throw 'cant get channel texture'
    }
    return texture;
  }

}

function generateTextureToPureColor(color: Vector3): Texture {
  const R = Math.floor(color.x * 256);
  const G = Math.floor(color.y * 256);
  const B = Math.floor(color.z * 256);
  const A = 256;
  const data = new Uint8ClampedArray([
    R, G, B, A, R, G, B, A, R, G, B, A, R, G, B, A
  ]);
  const texture = new Texture(TextureSource.fromPixelDataUint8(data, 2, 2));
  return texture;
}

function updateTextureToPureColor(texture: Texture, color: Vector3): Texture {
  return texture;
}