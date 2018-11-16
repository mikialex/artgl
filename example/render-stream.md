just api sketch;

```ts

const inputRenderStream = new RenderStream();

const scene = new Scene();

inputRenderStream.write(scene.getRenderable());


const myPassA = new Pass();
const tempFrame = new Frame();
myPassA.setTarget(tempFrame);




```