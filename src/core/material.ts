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

  channel: { [index: string]: Texture } = {};

  setChannel(channel: string, texture: Texture) {
    this.channel[channel] = texture;
  }

}