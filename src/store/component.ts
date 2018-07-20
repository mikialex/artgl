export class Component{
  constructor() {
    
  }
  store:any = {};
  objectInstance;
  name: string;
  render(props) {
    
  }
}

export class MyComponent extends Component{
  constructor() {
    super();
  }
  name: 'MyComponent'

  render(props) {
    if (this.store.a === true) {
      return h('object3D', null);
    } else {
      return null;
    }
  }
}
