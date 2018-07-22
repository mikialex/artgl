import { Component } from "./component";
import { ReactiveScene } from "./reactive-scene";

// demo usage 
// first, define several components that extends basecomponent
// these components defined how your construct you scene tree from data
// then, create  a root component, this component is mounted on the root of scene tree
// and regist all your component to ReactiveScene
// finally, create an ReactiveScene instance with a reative store as a reactive data provider
// get your autoUpdate autoMaintan reactive scenetree by renderRoot(yourRootComponent)

class MyComponent extends Component {
  constructor() {
    super();
  }
  name: 'MyComponent'

  render(props) { // props is not implemented
      return ReactiveScene.h('object3D', { a: props.a, rs_if:this.store.a});
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
        {
          a: "sdf",
          b: this.store.a,
          rx_if: this.store.b
        },
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

// reqiste THREE primitives
// this code can provide inner
declare var THREE: any;
const compiler = ReactiveScene.compiler;
compiler.registPrimitive({
  name: 'object3D',
  render: () => {
    return new THREE.Object3D;
  }
})


const RS = new ReactiveScene({
  store: {}
} as any);
const scene = RS.renderRoot(My3D);
