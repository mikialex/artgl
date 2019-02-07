import { Texture } from "./texture";
import { generateUUID } from "../math/uuid";

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

  setChannel(channel: ChannelType, texture: Texture) {
    this.channel[channel] = texture;
  }

  getChannelTexture(type: ChannelType) {
    return this.channel.get(type);
  }

}