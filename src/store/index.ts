import { Component } from "./component";
import { ReactiveScene } from "./reactive-scene";

export class MyComponent extends Component {
  constructor() {
    super();
  }
  name: 'MyComponent'

  render(props) {
    if (this.store.a === true) {
      return ReactiveScene.h('object3D', null);
    } else {
      return null;
    }
  }
}

class My3D extends Component {

  cal() {
    return this.store.a + this.store.b
  }

  render() {
    ReactiveScene.h(
      "scene",
      { test: this.cal() },
      ReactiveScene.h(
        "obj",
        { a: "sdf", b: this.store.a },
        ReactiveScene.h("obj", null)
      ),
      ReactiveScene.h(MyComponent, { name: "Sara" }),
      ReactiveScene.h("obj", null),
      ReactiveScene.h("obj", null)
    );
  }
}

ReactiveScene.registComponent(MyComponent)
ReactiveScene.registComponent(My3D)

const RS = new ReactiveScene({
  store: {}
} as any);
const scene = RS.renderRoot(My3D);
