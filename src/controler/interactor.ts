import { Controler } from "./controler";

// interactor resposible for handle web event from an element
// and dispatch control event to controlers
export class Interactor{
  constructor(el:HTMLElement) {
    
  }

  controlers: Controler[] = [];

  dispose() {
    
  }
}