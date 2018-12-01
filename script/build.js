
const execSync = require('child_process').execSync;
const path = require('path');

// remove previous build
const distDir = path.resolve('../dist');
execSync(`rm -rf ${distDir}`)

execSync(`npm run buildsrc`)
