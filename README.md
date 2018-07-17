## About Project

Artix is underdeveloping next generation advance webGL framework .

Artix 是下一代先进的webGL的渲染框架。为下一代webGL创意工具提供图形渲染框架。

> 该项目还处于开发和探索阶段。

## Design Aim

### Simple

* 简单可靠，易于维护调试。
* 仅保留核心组件，几何材质光源库按需引入，降低发布文件大小。

### Extensible

* 清晰和易于扩展的架构。
* 提供不同层次的抽象和封装，方便不同目的不同层次的使用。
* 通过独创的renderGraph架构，使得渲染流程配置化，声明式的定义管线逻辑。


### Powerful

* 基于renderGraph架构，整合多种优化算法，使得开发者能够针对不同场景特性，配置出不同的优化策略
* 基于renderGraph架构，整合多种特效，使得开发者能够针对不同业务需求，配置出不同的渲染效果
* 同时整合 webgl1 和 webgl2；
* 尝试支持deferred lighting

....

## DevDesigns

[材质系统](./src/material/dev-design.md)

[renderGraph](./src/render-graph/dev-design.md)

[uniform静态检查](./src/webgl/uniform/uniform-dev-design.md)

## 编码风格

* 文件夹 文件使用 小写字母和 - ，主要避免不同系统大小写行为，不同的git大小写配置导致的问题，同时具有更好的可读性。
* 尽量不使用index.ts做为文件名，文件名和文件夹名字冗余并不是什么问题，这只会造成不知道一堆index是什么东西的情况。
* code编写尽量匹配tslint的官方最佳实践，项目早期不会引入lint工具进行强制检查。