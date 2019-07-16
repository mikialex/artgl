const md = require('./gen-md');
const fs = require('fs');
const path = require('path');
const utils = require('./utils');

function genMarkdowns(contentFoldPath, distFoldPath) {
  const fileList = fs.readdirSync(contentFoldPath);
  fileList.forEach(fileName => {
    const filePath = contentFoldPath + '/' + fileName;
    const distPath = distFoldPath + '/' + utils.splitFileName(fileName) + '.md';
    if (fs.statSync(filePath).isFile()) {
      console.log(` gen markdown file from: ${filePath}`)
      md.generateMD(filePath, distPath)
    }
  })
}



function build() {
  const inputFolderPath = path.resolve(__dirname, '../contents');
  const distFolderPath = path.resolve(__dirname, '../build');
  console.log("start gen markdown file from content folder")
  genMarkdowns(inputFolderPath, distFolderPath);
}

build();