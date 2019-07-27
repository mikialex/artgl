const webpack = require('webpack');
const path = require('path');
const child_process = require('child_process')

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
      if (err || stats.hasErrors()) {
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
  const examplesRoot = path.resolve(__dirname, '../contents/exports');
  const examplesDistPath = path.resolve(__dirname, '../build/');
  console.log('start build example')
  await compileProject(examplesRoot, examplesDistPath)
  console.log('build example success')
  const serverChild = await startStaticServer(examplesDistPath, 3000)
  console.log('static server has started')

  await runHeadlessTest('localhost:3000')
}

runAllTest();