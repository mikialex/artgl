function splitFileName(text) {
  var pattern = /\.{1}[a-z]{1,}$/;
  if (pattern.exec(text) !== null) {
    return (text.slice(0, pattern.exec(text).index));
  } else {
    return text;
  }
}

module.exports = {
  splitFileName
}