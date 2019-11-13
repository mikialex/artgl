const indentSpaceSize = 2;
let indentUnit = '';
for (let i = 0; i < indentSpaceSize; i++) {
  indentUnit += ' ';
  
}
const indentStringCache: string[] = [];
export function getIndent(indentCount: number):string {
  if (indentStringCache[indentCount] !== undefined) {
    return indentStringCache[indentCount];
  }
  let str = '';
  for (let i = 0; i < indentCount; i++) {
    str += indentUnit;
  }
  indentStringCache[indentCount] = str;
  return str;
}