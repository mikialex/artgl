import { getIndent } from "./indent";

export class CodeBuilder{

  currentIndent: number = 0;
  result: string = ""

  addIndent() {
    this.currentIndent++;
  }
  reduceIndent() {
    this.currentIndent--;
  }

  emptyLine() {
    this.writeLine("")
  }

  writeLine(value: string) {
    this.result += getIndent(this.currentIndent) + value + "\n"
  }

  writeBlock(value: string) {
    const lines = value.split("\n");
    lines.forEach(line => {
      const trimmed = line.trim()
      if (trimmed.length > 0) {
        this.writeLine(trimmed);
      }
    })
  }

  writeBlockRaw(value: string) {
    this.result += value;
  }

  writeCommentBlock(value: string) {
    this.writeLine("/*")
    value.split("\n").forEach(line => {
      this.writeLine(" * " + line)
    })
    this.writeLine(" */")
  }

  reset() {
    this.currentIndent = 0;
    this.result = ""
  }
  output() {
    const result = this.result;
    this.reset();
    return result
  }
}