import { Texture } from "./texture";

interface materialConfig{

}

export class Material{
  // constructor(conf: materialConfig) {
    
  // }

  channel: { [index: string]: Texture } = {};

  setChannel(channel: string, texture: Texture) {
    this.channel[channel] = texture;
  }

}