
# ArtGL, a TypeScript Web3D framework

## Design & Features

### Easy and clear

As easy as three.js. You can regard this project as a better three.js, maybe with better design and better code quality. Many code referenced from three.js :)

### Extendable architecture

Instead of making a specific renderer for specific usage, or a general renderer that hard to extent features, artgl is a  framework for general usage. You can easily customize it, extent it to meet you requirements.

### Declarative render pipeline by renderGraph API

Build your post-process pipeline use rendergraph api, we will handle everything about render procedure. Auto support FBO reuse. Make multi pass rendering, add custom optimizer, tweaking effects, debug performance, more delightful than before.

### Expressive shading abstraction by shaderGraph API

We also use graph as the shader fragment linker. Its a revolutionary improvement of composability in shader source and shader computation abstraction.  No more confusing #define #include. Make shader effect development productive and provide a sound abstraction in artgl shading model. **You can write shader effect in component style**, and compose them freely, publish them, organize your code better than before.

### Alway use advance WebGL API, and auto downgrade

When WebGL2 supports, it would be used, or we will **auto** downgrade to 1 (try our best). When VAO or UBO support, we **auto** support and auto downgrade gracefully.

### Experimental WebAssembly accelerated scene render data computation

Performance matters.

....

## projects

source: [https://github.com/mikialex/artgl](https://github.com/mikialex/artgl)

This repo also contains sub projects: example/ and viewer/

[example readme(cn/zh)](./packages/example/README.md)

[viewer readme](./packages/viewer/README.md)

## Posts(cn/zh)

[https://mikialex.github.io/2019/08/11/fbo-reuse-in-rendergraph-artgl/](https://mikialex.github.io/2019/08/11/fbo-reuse-in-rendergraph-artgl/)

[https://mikialex.github.io/2019/08/03/uniform-upload-design/](https://mikialex.github.io/2019/08/03/uniform-upload-design/)

[https://mikialex.github.io/2019/07/16/graph-based-shadersource-management/](https://mikialex.github.io/2019/07/16/graph-based-shadersource-management/)

[https://mikialex.github.io/2019/03/12/artgl-about/](https://mikialex.github.io/2019/03/12/artgl-about/)

[https://mikialex.github.io/2019/04/30/wasm-scene/](https://mikialex.github.io/2019/04/30/wasm-scene/)

Some old post maybe not meet the current design, just for reference;

## Some samples here

### ShaderGraph API

Its a typical shader effect component:

```ts

@ShadingComponent()
export class PhongShading<T> extends BaseEffectShading<PhongShading<T>> {
  constructor(lights: Array<Light<T>>) {
    super();
    this.lights = lights
  }

  decorate(graph: ShaderGraph): void {
    graph.setFragmentRoot(
      collectLightNodes<T>(this.lights,
        (light) => {
        return phongShading.make()
        .input("lightDir", light.produceLightFragDir(graph))
        .input("lightIntensity", light.produceLightIntensity(graph))
        .input("surfaceNormal", graph.getVary(NormalFragVary))
        .input("eyeDir", graph.getEyeDir())
        .input("shininess", this.getPropertyUniform("shininess"))
      })
    )
  }

  foreachProvider(visitor: (p: ShaderUniformProvider) => any) {
    visitor(this);
    this.lights.forEach(light => {
      visitor(light);
    })
  }

  lights: Array<Light<T>>

  @Uniform("shininess")
  shininess: number = 15;

}
```

### Shading API

And you can use the things above in shading api:

Decorate shading with any other shading decorator. Provide uniform block with extendable shading provider.

```ts
  ...
  const pointLight = new PointLight();
  pointLight.position = new Vector3(-1, 3, 3);
  pointLight.color = new Vector3(0.9, 0.8, 0.5);
  pointLight.radius = 10;

  const ambient = new AmbientLight();
  ambient.color = new Vector3(0.3, 0.3, 0.4);

  const dirLight = new DirectionalLight();
  dirLight.color = new Vector3(0.3, 0.6, 0.8);
  dirLight.direction = new Vector3(1, 1, -1).normalize();

  const exposureController = new ExposureController();

  const phong = new PhongShading<DirectionalLight | PointLight>([dirLight, pointLight]);

  let shading = new Shading()
    .decorate(phong)
    .decorate(ambient)
    .decorate(exposureController)

  const planeMesh = new Mesh().g(planeGeo).s(shading)
  root.addChild(planeMesh);
  ...

```

### RenderGraph API

```ts
const depthPass = pass("depthPass").use(scene.renderScene)
  .overrideShading(this.depthShader)

const scenePass = pass("scenePass")
  .use(scene.render)

const depthResult = target("depthResult").needDepth().from(depthPass)
const sceneResult = target("sceneResult").needDepth().from(scenePass)

const createTAA = () => {
  const taaPass = pass("taa").useQuad()
    .overrideShading(this.taaShader)
    .disableColorClear()
    .beforeExecute(() => {
      this.engine.unJit();
      const VP: Matrix4 = this.engine.globalUniforms.VPMatrix.value
      this.taaShading.VPMatrixInverse = this.taaShading.VPMatrixInverse.getInverse(VP, true);
      this.taaShading.sampleCount = this.sampleCount;
    })
    .input("sceneResult", sceneResult)
    .input("depthResult", depthResult)
    .input("TAAHistoryOld", this.taaHistory.ping())

  return taaPass
}

const AAedScene = when(this._enableTAA, this.taaHistory.pong().from(createTAA()), sceneResult)

const createTSSAO = () => {
  const tssaoPass = pass("tssao").useQuad()
    .overrideShading(this.tssaoShader)
    .disableColorClear()
    .beforeExecute(() => {
      const VP: Matrix4 = this.engine.globalUniforms.VPMatrix.value
      this.tssaoShading.VPMatrixInverse = this.tssaoShading.VPMatrixInverse.getInverse(VP, true);
      this.tssaoShading.sampleCount = this.sampleCount;
    })
    .input("depthResult", depthResult)
    .input("AOAcc", this.tssaoHistory.ping())

  const tssaoCompose = pass("composeAll").useQuad()
    .overrideShading(this.composeShader)
    .input("basic", AAedScene)
    .input("tssao", this.tssaoHistory.pong().from(tssaoPass))
    .beforeExecute(() => {
      this.composeShading.sampleCount = this.sampleCount;
    })
    .disableColorClear()

  return tssaoCompose;
}

this.graph.setScreenRoot(
  screen().from(
    when(
      this._enableTSSAO,
      createTSSAO(),
      pass("copy").useQuad().overrideShading(copier)
        .input("copySource", AAedScene))
  )
)
```
