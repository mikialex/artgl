
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
  private tokens = [];
  private rules: LexerRule[] = [];
  private remove = 0;
  private state = 0;
  private index = 0;
  private input: string = "";
  private reject: boolean = false;

  defunct (chr: string) {
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
    let index = 0;

    var state = this.state;
    var lastIndex = this.index;
    var input = this.input;

    this.rules.forEach(rule => {
      const start = rule.start;
      const states = start.length;

      if ((states === 0 || start.indexOf(state) >= 0) || (state % 2 !== 0 && states === 1 && start[0] === 0)) {
        var pattern = rule.pattern;
        pattern.lastIndex = lastIndex;
        var result = pattern.exec(input);

        if (result && result.index === lastIndex) {
          let j: number = matches.push({
            result: result,
            action: rule.action,
            length: result[0].length
          });

          if (rule.global) index = j;

          while (--j > index) {
            var k = j - 1;

            if (matches[j].length > matches[k].length) {
              var temple = matches[j];
              matches[j] = matches[k];
              matches[k] = temple;
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

      while (matches.length > 0) {
        if (this.reject) {
          const match = matches.shift()!;
          var result = match.result;
          var length = match.length;
          this.index += length;
          this.reject = false;
          this.remove++;

          var token = match.action.apply(this, result);
          if (this.reject) {
            this.index = result.index;
          } else if (token !== undefined) {
            if (Array.isArray(token)) {
              this.tokens = token.slice(1);
              token = token[0];
            } else {
              if (length !== 0) {
                this.remove = 0;
              }
              return token;
            }
          }
        } else break;
      }

      var input = this.input;

      if (index < input.length) {
        if (this.reject) {
          this.remove = 0;
          var token = this.defunct(input.charAt(this.index++));
          if (token !== undefined) {
            if (Object.prototype.toString.call(token) === "[object Array]") {
              tokens = token.slice(1);
              return token[0];
            } else return token;
          }
        } else {
          if (this.index !== index) remove = 0;
          this.reject = true;
        }
      } else if (matches.length)
        this.reject = true;
      else break;
    }
  };


}

