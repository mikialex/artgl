require('./gen-md').genMarkdowns;

function genMarkdowns(contentFoldPath, distFoldPath) {
  const fileList = fs.readdirSync(contentFoldPath);
  fileList.forEach(fileName => {
    const filePath = contentFoldPath + '/' + fileName;
    const distPath = distFoldPath + '/' + fileName;
    if (fs.statSync(filePath).isFile()) {
      genMarkdowns(filePath, distPath)
    }
  })
}

function build() {
  // genMarkdowns();
}

build();