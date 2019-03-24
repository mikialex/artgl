# 设想基于 offscreen canvas 的异步渲染引擎

chrome 70 release了一项非常重要的 feature 叫 Offscreen [Canvas](https://developers.google.com/web/updates/2018/08/offscreen-canvas)， 概括的来说： 你可以在webworker中执行渲染了。这是一个非常巨大的改变，能够带来非常巨大的潜在性能提升。

在一般的3d应用中，我们业务逻辑， 业务数据到dom， 业务数据到场景树，准备和执行渲染，这一系列工作几乎全部在主线程中执行。除了一些非常重的计算可能会优化到webworker中进行，但是general的来说，web 3d应用几乎都难以利用到现代处理器多核心的优势。从我在业务中的实践而言， 主线程约 60% ~ 70% 的时间是在 业务数据到dom， 业务数据到场景树更新等业务耗时， 剩下的主要是渲染耗时。设想一下，如果我们把渲染的耗时全部搬到webworker中，那岂不是一个巨大的稳定的性能飞跃？

# WebAssembly 渲染引擎