import { Camera } from "../core/camera";

// controler is about how to minupulate camera easliy
export class Controler{
  constructor(camera: Camera) {
    this.camera = camera;
  }
  camera: Camera;
}