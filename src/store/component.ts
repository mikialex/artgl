import { Watcher } from "./watcher";

// component is a composeabel fragment of scene descripition
// that map reactive data from props or store to scene tree
//
// component is directly rendered by reactive scene
export class Component{
  constructor() {
    
  }
  store:any = {};
  objectInstance;
  parent: Component;
  children: Component[];
  watchers: Watcher[];
  name: string;
  render(props) {
    
  }

  componentWillMount() {
    
  }

  //...other hooks
}
