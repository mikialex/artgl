const webpack = require('webpack');
const path = require('path');
const child_process = require('child_process')
const { runHeadlessTest } = require('./puppeteer.js')

async function compileProject(rootPath, distPath) {
  const config = {
    mode: "development",
    entry: {
      app: rootPath,
    },
    devtool: 'source-map',
    output: {
      filename: 'artgl-example.js',
      path: distPath
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
    },
    module: {
      rules: [{
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }]
    },
  }

  return new Promise((resolve, reject) => {
    webpack(config, (err, stats) => {
      if (err) {
      // if (err || stats.hasErrors()) {
        reject(err, stats);
      }
      resolve(stats);
    });
  })
}

async function startStaticServer(rootPath, port){
  const config = {
    rootPath, port
  }
  const configParam = `"` + JSON.stringify(config).replace(/"/g, `\\\"`) + `"`
  const serverScript = path.resolve(__dirname, "./static-server.js")
  const command = `node ${serverScript} ${configParam}`

  // console.log(command);
  let hasServerStarted = false;
  return new Promise((resolve, reject) => {
    const child = child_process.exec(command,
      (error, stdout, stderr) => {
        // if server has started, we not care the error
        if (error && !hasServerStarted) {
          reject(error)
        }
      })
    // this is just for simple
    child.stdout.on("data", (data) => {
      if (data.trim() === "server started") {
        hasServerStarted = true;
        resolve(child)
      }
    })
  })
}


async function runAllTest() {
  const examplesRoot = path.resolve(__dirname, '../src/regression-entry.ts');
  const examplesDistPath = path.resolve(__dirname, '../build/');
  console.log('start build example')
  await compileProject(examplesRoot, examplesDistPath)
  console.log('build example success')
  const serverChild = await startStaticServer(examplesDistPath, 3000)
  console.log('static server has started')

  const codePath = path.resolve(__dirname, '../build/artgl-example.js')
  await runHeadlessTest('localhost:3000', codePath)

  serverChild.kill();
}

runAllTest();