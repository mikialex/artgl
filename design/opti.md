
# 状态管理

## drawcall 排序

drawcall排序一方面是为了满足业务需求，某些效果依赖绘制的顺序。当然，一些很基础的流程也依赖排序，比如透明需要在不透明之后按照距离排序等。另外主要是为了性能：1使得gl状态切换最小化，2：使得较前的像素提前画计算减少片元着色计算。（有依赖于硬件支持？）

threejs使用考虑了材质类别，绘制状态及距离的比较函数进行快速排序，只能说一般般。

关于sorting，这篇内容介绍了stringray 引擎使用sortkey 来排序的实现 [stingray sort key](http://bitsquid.blogspot.com/2017/02/stingray-renderer-walkthrough-4-sorting.html)。 简而言之 stingray使用了64位的sortkey，以此为基础进行基数排序.

``` 
MSB [ 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000 ] LSB
      ^ ^       ^  ^                                   ^^                 ^
      | |       |  |                                   ||                 |- 3 bits - Shader System (Pass Immediate)
      | |       |  |                                   ||- 16 bits - Depth
      | |       |  |                                   |- 1 bit - Instance bit
      | |       |  |- 32 bits - User defined
      | |       |- 3 bits - Shader System (Pass Deferred)
      | - 7 bits - Layer System
      |- 2 bits - Unused

```
我认为这种实现是非常优秀的，结合rendermodel的设计，渲染数据直接存储在sortkeyArray中，直接在索引数组进行原地排序可能是性能最高的方案。



# 剔除系统

## 视锥剔除

简而言之: 看不见的东西就不画，主要使用视锥体的各个片和简单包围体进行位置判断。使用时要注意物体的包围盒是否真的是严格包围物体，比如投影的问题就比较麻烦。

## 细节剔除

简而言之： 当物体理我们非常远，或者非常的小，小到几个像素的大小，那么我们用很大的开销画这么几个像素是没有必要的。在对画面质量要求不高的情况下，我们可以省略这些东西的绘制，或者使用成本非常低的方案替代，比如画点之类的。

比较genenral的实现是，实时计算每一个drawcall的简单包围体在屏幕空间的投影大小。

一些引擎可以针对物体设置超过一定距离不可见，也类似于此。

## 遮挡剔除

这个有点复杂。

## 预计算可见性

也有点复杂。

[PVS](http://multi-crash.com/?p=51)

[UE4 类似体素化的方案](https://blog.csdn.net/jiangdengc/article/details/57421898)

# 加速结构



# 渐进渲染