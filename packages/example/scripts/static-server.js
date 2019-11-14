const StaticServer = require('static-server');
const config = JSON.parse(process.argv[2]);

const server = new StaticServer({
    rootPath: config.rootPath,            // required, the root of the server file tree
    port: config.port,               // required, the port to listen
    name: 'artgl-test-server',   // optional, will set "X-Powered-by" HTTP header
    // host: '10.0.0.100',       // optional, defaults to any interface
    cors: '*',                // optional, defaults to undefined
    followSymlink: true,      // optional, defaults to a 404 error
});

server.start(function () {
    console.log("server started")
});
