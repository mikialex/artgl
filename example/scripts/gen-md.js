const fs = require('fs');

function generateMD(inputFilePath, distPath) {
  const sourcefileContent = fs.readFileSync(inputFilePath, "utf-8").split('\n');
  let mdStr = ""

  for (let i = 0; i < sourcefileContent.length; i++) {
    const line = sourcefileContent[i]
    if (line.slice(0, 5) === '//== ') {
      const { result, move } = readMDSegment(content, i);
      i += move;
      mdStr += result;
    } else if (line.slice(0, 6) === '//==> ') {
      const { result, move } = readMDCodeSegment(content, i);
      i += move;
      mdStr += result;
    }
  }
  console.log(mdStr)
  


}

function readMDSegment(sourcefileContent, index) {
  let move = 1;
  let MDSegment = "";
  for (let i = index; i < sourcefileContent.length; i++) {
    move++;
    const line = sourcefileContent[i]
    if (line.slice(0, 4) === '//== ') {
      return {
        move, result:MDSegment
      }
    }
    if (line.slice(0, 1) == "//") {
      const lineContent = line.slice(3).replace(" ", "");
      if (lineContent === '') {
        MDSegment += "\n"
      } else {
        MDSegment += lineContent
      }
    }
  }
}

function readMDCodeSegment(content, index) {
  let move = 1;
  for (let i = index; i < sourcefileContent.length; i++) {
    const line = sourcefileContent[i]
  }
}

module.exports = {
  generateMD,
}