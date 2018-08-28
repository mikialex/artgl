
import { Interactor } from "./interactor";

// controler is about how to minupulate camera easliy
export class Controler{
  constructor(interactor: Interactor) {
    this.interactor = interactor;
  }
  interactor: Interactor;
}