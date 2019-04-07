import { Texture } from "./texture";
import { generateUUID } from "../math/uuid";
import { Vector3 } from "../math/index";

export const enum ChannelType{
  diffuse = 'diffuse',
  roughness = 'roughness',
  metalic = 'metalic',
  ao = 'ao'
}


/**
 * Material is collection of textures
 * contains bitmap render data
 * @export
 * @class Material
 */
export class Material{

  uuid = generateUUID();
  private channel: Map<ChannelType, Texture> = new Map();

  setChannelColor(channel: ChannelType, color: Vector3) {
    let channelTexture = this.channel.get(channel);
    if (channelTexture === undefined) {
      channelTexture = generateTextureToPureColor(color);
    } else {
      updateTextureToPureColor(channelTexture, color);
    }
  }

  setChannelTexture(channel: ChannelType, texture: Texture) {
    this.channel[channel] = texture;
  }

  getChannelTexture(type: ChannelType) {
    return this.channel.get(type);
  }

}

function generateTextureToPureColor(color: Vector3): Texture {
  const texture = new Texture(); 
  const R = Math.floor(color.x * 256);
  const G = Math.floor(color.y * 256);
  const B = Math.floor(color.z * 256);
  texture.textureData = new Uint8ClampedArray([
    R, G, B, R, G, B, R, G, B, R, G, B, 
  ]);
  return texture;
}

function updateTextureToPureColor(texture: Texture, color: Vector3): Texture {
  return texture;
}