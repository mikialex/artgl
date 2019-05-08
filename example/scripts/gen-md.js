const fs = require('fs');

function generateMD(inputFilePath, distPath) {
  const sourcefileContent = fs.readFileSync(inputFilePath, "utf-8");

}
module.exports = {
  generateMD,
}