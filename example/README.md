# 示例文档

此文件目录下为 artgl 示例目录。 每一个例子是 contents 目录下一个单独的ts文件。在ts文件中，除了示例代码，还通过特有的格式添加 markdown 注释。 使用 node 运行 script 中的 index.js， 可以将这些用例编译为可执行的静态文档页面以方便用户阅读。编译输出至 build 目录下，可直接使用阅读器查看这些文档。 

由于直接使用代码作为用例，在项目开发过程中，可以通过这些用户用例的类型检查和运行结果来进行用例的回归测试。 我们将会引入自动化的方式批量的对这些用例进行回归，以提高工程质量和开发效率。

## 执行自动化测试的流程

contents 目录下每一个 ts 文件， 默认导出一个 async function， 这个 function 中完成相关功能测试，function运行结束后，一般会留下能让用户继续进行交互的 demo 继续运行。

第一步：测试系统会收集这些测试文件，自动生成一个汇集这些 function 的 ts 入口文件，并且以此文件进行 webpack 打包。 生成的js package 会注入到 template 目录下的 html中。 

第二步： 启动一个静态服务器，serve html 和 依赖的其他静态资源。

第三步： foreach 测试 function， 启动一个 puppeteer headless 浏览器，执行测试function，完成基本的测试。

第四步： 生成相应的测试报告。

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

const engine = new ARTGL.ARTEngine(canv);

const scene = new ARTGL.Scene();

let testMesh = new ARTGL.Mesh();

scene.root.addChild(testMesh);

engine.render(scene);

//==<

这一格式包裹的代码会被提取为markdown 代码块

```

## 其他

建议在 `yarn dev` 前配置 `yarn config set puppeteer_download_host=https://storage.googleapis.com.cnpmjs.org`  以解决由于某些网络问题造成依赖安装失败的错误
