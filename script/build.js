
const execSync = require('child_process').execSync;
const path = require('path');
const delDir = require('./util.js').delDir;

// remove previous build
const distDir = path.resolve(__dirname, '../dist');
console.log(`source code will build at: ${distDir}`)
delDir(distDir)
console.log(`old folder has been cleaned`)

try {
  execSync(`yarn buildsrc`)
} catch (error) {
  console.log(error)
}
