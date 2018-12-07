
const execSync = require('child_process').execSync;
const path = require('path');

// remove previous build
const distDir = path.resolve(__dirname, '../dist');
console.log(distDir)
execSync(`rm -rf ${distDir}`)

execSync(`npm run buildsrc`)

// copy files
const rootDir = path.resolve(__dirname, '../');
execSync(`cp ${rootDir + '/package.json'} ${distDir}`)
execSync(`cp ${rootDir + '/README.md'} ${distDir}`)
