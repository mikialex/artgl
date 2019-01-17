import { Texture } from "./texture";

interface materialConfig{

}


/**
 * Material is collection of textures
 * contains bitmap render data
 * @export
 * @class Material
 */
export class Material{
  // constructor(conf: materialConfig) {
    
  // }

  private channel: Map<string, Texture> = new Map();

  setChannel(channel: string, texture: Texture) {
    this.channel[channel] = texture;
  }

  getChannelTexture(name: string) {
    return this.channel.get(name);
  }

}