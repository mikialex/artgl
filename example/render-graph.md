```ts

//demo

const scene = new Scene();
// make scene

const engine = new ARTEngine();
const camera = new PerspectiveCamera();
engine.setCamera(camera);

const testGraph = new RenderGraph();


const cameraWrap = new EntityNode('myCamera', testGraph);
cameraWrap.makeEntity(camera, 'camera')

const cullingNode = new FilterNode('frustum culling', testGraph);
cullingNode.setFilter({
  func: () => {
    return false;
  },
  dependency: [
    {
      node: cameraWrap,
      key: 'camera'
    }
  ]
})

const renderNode = new RenderNode('forwardRender', testGraph);
renderNode.setEngine(engine);

renderNode.defineDependency(cullingNode);

const frameNode = new FrameNode('forwardResult', testGraph);
frameNode.defineDependency(renderNode);

testGraph.pipeRenderList(scene.generateRenderList(), cullingNode);
renderNode.render();

```