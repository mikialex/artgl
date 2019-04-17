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

  writeLine(value: string) {
    this.result += getIndent(this.currentIndent) + value + "\n"
  }

  writeBlock(value: string) {
    const lines = value.split("\n");
    lines.forEach(line => {
      const trimed = line.trim()
      if (trimed.length > 0) {
        this.writeLine(trimed);
      }
    })
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