# 示例文档

此文件目录下为 artgl 示例目录。 每一个例子是 constents 目录下一个单独的ts文件。在ts文件中，除了示例代码，还通过特有的格式添加 markdown 注释。 使用 node 运行 script 中的 index.js， 可以将这些用例编译为可执行的静态文档页面以方便用户阅读。编译输出至 build 目录下，可直接使用浏览器查看这些文档。 

由于直接使用代码作为用例，在项目开发过程中，可以通过这些用户用例的类型检查和运行结果来进行用例的回归测试。 我们将会引入自动化的方式批量的对这些用例进行回归，以提高工程质量和开发效率。

## 如何编写带有 markdown 注释的ts文件


markdown 注释：

```

//==
// # 基本使用
//
//==

这一格式的注释会被提取为markdown，其中可以使用基本的markdown语法

```

markdown 代码块：

``` ts

//==>
let canv = document.querySelector('canvas');

const engine = new ARTGL.ARTEngine();

const scene = new ARTGL.Scene();

const camera = new ARTGL.PerspectiveCamera();

let testMesh = new ARTGL.Mesh();

scene.root.addChild(testMesh);

engine.render(scene);

//==<

这一格式包裹的代码会被提取为markdown 代码块

```

