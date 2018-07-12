## About Project

Artix is underdeveloping next generation advance webGL framework .

Artix 是下一代先进的webGL的渲染框架。为下一代webGL创意工具提供图形实现基础。

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

* 基于renderGraph架构，整合多种优化算法，，使得开发者能够针对不同场景特性，配置出不同的优化策略
* 基于renderGraph架构，整合多种特效算法，，使得开发者能够针对不同业务需求，配置出不同的渲染效果
* 同时整合 webgl1 和 webgl2；
* 尝试支持deferred lighting

....

## DevDesigns

[材质系统](./src/material/dev-design.md)
[renderGraph](./src/render-graph/dev-design.md)