

## About Project

ArtGL is an underdevelopment next generation webGL framework.

## Design

### easy and clear

As easy as three.js. You can regard this project as a better three.js, with better design and better code quality.

### extendable architecture

Instead of making a specific renderer for specific usage, or a general renderer that hard to extent features, artgl is a  framework for general usage. You can easily customize it, extent it to meet you real requirements.

### declarative and powerful render pipeline by renderGraph

Write a json like config for renderGraph, the rendergraph will handle all things about render procedure. Make multi pass rendering, add custom optimizer, tweaking effects, debug performance, more delightful.

### experimental shaderGraph for reliable and expressive shader source abstraction

We also use graph as the shader fragment linker. No more confusing #define #include, make shader effect development productive as well as a good abstraction for shader factory.

### experimental WebAssembly accelerated scene render data computation 

Performance matters.

....

Some sample code here:

```ts

const scene = new Scene();
const light = new PointLight();

scene.add(light)

const mesh = new Mesh();

mesh.geometry = new SphereGeometry();
mesh.material = new Material();
mesh.material.channel(Channel.Diffuse).load("../diff.png");

mesh.shading = (new MeshBasicShading()).decorate();
mesh.shadingParam = mesh.shading.make();
mesh.shading.set("opacity", 0.5);

mesh.lights = 

```