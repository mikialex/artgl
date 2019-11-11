
// Lexer.defunct = function (chr) {
//     throw new Error("Unexpected character at index " + (this.index - 1) + ": " + chr);
// };
// try {
//     Lexer.engineHasStickySupport = typeof /(?:)/.sticky == 'boolean';
// } catch (ignored) {
//     Lexer.engineHasStickySupport = false;
// }
// try {
//     Lexer.engineHasUnicodeSupport = typeof /(?:)/.unicode == 'boolean';
// } catch (ignored) {
//     Lexer.engineHasUnicodeSupport = false;
// }

// https://github.com/aaditmshah/lexer/blob/master/lexer.js

interface LexerRule {
  pattern: RegExp,
  global: boolean,
  action: Function,
  start: number[]
}

interface ScanMatch {
  result: RegExpExecArray,
  action: Function,
  length: number,
}

class Lexer {
  private tokens: any[] = [];
  private rules: LexerRule[] = [];
  private remove = 0;

  state = 0;

  private index = 0;
  private input: string = "";
  private reject: boolean = false;

  defunct(chr: string) {
    throw new Error("Unexpected character at index " + (this.index - 1) + ": " + chr);
  }

  addRule(pattern: RegExp, action: Function, start?: number[] = [0]) {
    const global = pattern.global;

    // if (!global || Lexer.engineHasStickySupport && !pattern.sticky) {
    //     var flags = Lexer.engineHasStickySupport ? "gy" : "g";
    //     if (pattern.multiline) flags += "m";
    //     if (pattern.ignoreCase) flags += "i";
    //     if (Lexer.engineHasUnicodeSupport && pattern.unicode) flags += "u";
    //     pattern = new RegExp(pattern.source, flags);
    // }

    this.rules.push({ pattern, global, action, start });
    return this;
  }

  setInput(input: string) {
    this.remove = 0;
    this.state = 0;
    this.index = 0;
    this.tokens = [];
    this.input = input;
    return this;
  }

  private scan() {
    const matches: ScanMatch[] = [];

    this.rules.forEach(rule => {
      const start = rule.start;

      if ((start.length === 0 || start.indexOf(this.state) >= 0) || (this.state % 2 !== 0 && start.length === 1 && start[0] === 0)) {
        const pattern = rule.pattern;
        pattern.lastIndex = this.index;
        var result = pattern.exec(this.input);

        if (result !== null && result.index === this.index) {
          matches.push({
            result: result,
            action: rule.action,
            length: result[0].length
          });

          let j = matches.length;
          if (rule.global) {
            return;
          }

          // sort
          while (--j > 0) {
            const k = j - 1;
            if (matches[j].length > matches[k].length) {
              var temp = matches[j];
              matches[j] = matches[k];
              matches[k] = temp;
            }
          }

        }
      }
    })

    return matches;
  }

  lex() {
    if (this.tokens.length > 0) {
      return this.tokens.shift();
    }

    this.reject = true;

    while (this.index <= this.input.length) {
      var matches = this.scan().splice(this.remove);
      var index = this.index;

      while (matches.length > 0 && this.reject) {
        const match = matches.shift()!;
        this.index += length;
        this.reject = false;
        this.remove++;

        var token = match.action(match.result);
        if (this.reject) {
          this.index = match.result.index;
        } else if (token !== undefined) {
          if (Array.isArray(token)) {
            this.tokens = token.slice(1);
            token = token[0];
          } else {
            if (match.length !== 0) {
              this.remove = 0;
            }
            return token;
          }
        }
      }

      var input = this.input;

      if (index < input.length) {
        if (this.reject) {
          this.remove = 0;
          // var token = this.defunct(input.charAt(this.index++));
          // if (token !== undefined) {
          //   if (Array.isArray(token)) {
          //     this.tokens = token.slice(1);
          //     return token[0];
          //   } else return token;
          // }
        } else {
          if (this.index !== index) {
            this.remove = 0;
          }
          this.reject = true;
        }
      } else if (matches.length > 0) {
        this.reject = true;
      } else {
        break
      };
    }
  };


}

