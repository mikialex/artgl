const md = require('./gen-md');
const fs = require('fs');
const path = require('path');

function genMarkdowns(contentFoldPath, distFoldPath) {
  const fileList = fs.readdirSync(contentFoldPath);
  fileList.forEach(fileName => {
    const filePath = contentFoldPath + '/' + fileName;
    const distPath = distFoldPath + '/' + fileName;
    if (fs.statSync(filePath).isFile()) {
      md.generateMD(filePath, distPath)
    }
  })
}



function build() {
  const inputFolderPath = path.resolve(__dirname, '../contents');
  const distFolderPath = path.resolve(__dirname, '../build');
  genMarkdowns(inputFolderPath, distFolderPath);
}

build();