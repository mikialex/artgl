

## About Project

ArtGL is an underdeveloping next generation webGL framework.

## Design

### easy and clear

As easy as three.js. You can regard this project as a better three.js, with better design and better code quality.

### extentable & pluggable architecture

Instead of making a specific renderer for specific usage, or a general renderer that hard to extent features, artgl is a  framework for general usage. You can easily customize it, extent it to meet you real requirements.

### declaretive and powerful render pipline by renderGraph

Write a json like config for renderGraph, the rendergraph will handle all things about render procedrue. Make multi pass rendering, add custom optimzer, tweaking effects, debug performence, more delightful.

### experimental shaderGraph for reliable and expressive shader source abstraction

We also use graph as the shader fragment linker. No more confusing #deine #include, make shader effect development productive as well as a good abstraction for shader factory.

### experimental WebAssembly accelerated scene render data computation 

Performance matters.

....



posts (zh/cn)：

[关于ARTGL](./design/about.md)

[概念模型](./design/concept.md)
