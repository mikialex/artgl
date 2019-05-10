const fs = require('fs');

function generateMD(inputFilePath, distPath) {
  const content = fs.readFileSync(inputFilePath, "utf-8").split('\n')
    .map(line => line.trim())
  let mdStr = ""

  for (let i = 0; i < content.length; i++) {
    const line = content[i];
    if (isMDSegmentStart(line)) {
      const { result, move } = readMDSegment(content, i);
      i += move;
      mdStr += result;
    } else if (isMDCodeSegmentStart(line)) {
      const { result, move } = readMDCodeSegment(content, i);
      i += move;
      mdStr += result;
    }
  }
  console.log(mdStr)
  


}

function isMDSegmentStart(line) {
  return line === '//==';
}

function isMDSegmentEnd(line) {
  return line === '//==';
}


function readMDSegment(sourcefileContent, index) {
  let move = 1;
  let MDSegment = "";
  for (let i = index + 1; i < sourcefileContent.length; i++) {
    move++;
    const line = sourcefileContent[i]
    if (isMDSegmentEnd(line)) {
      return {
        move, result:MDSegment
      }
    }
    if (line.slice(0, 2) == "//") {
      const lineContent = line.slice(3).trim()
      if (lineContent === '') {
        MDSegment += "\n"
      } else {
        MDSegment += lineContent
      }
    }
  }
  throw "cant find MDSegment end"
}

function isMDCodeSegmentStart(line) {
  return line === '//==>'
}

function isMDCodeSegmentEnd(line) {
  return line === '//==<'
}

function readMDCodeSegment(sourcefileContent, index) {
  let move = 1;
  let MDSegment = "";
  for (let i = index + 1; i < sourcefileContent.length; i++) {
    move++;
    const line = sourcefileContent[i]
    if (isMDCodeSegmentEnd(line)) {
      return {
        move,
        result: MDSegment
      }
    } else {
      MDSegment += line
      MDSegment += "\n"
    }
  }
  throw "cant find MD Code Segment end"
}

module.exports = {
  generateMD,
}