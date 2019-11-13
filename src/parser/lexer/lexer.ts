
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

interface LexerRule<TokenType> {
  pattern: RegExp,
  global: boolean,
  action: TokenAction<TokenType>,
  start: number[]
}

interface ScanMatch {
  result: RegExpExecArray,
  action: Function,
  length: number,
}

interface Token<TokenType> {
  type: TokenType,
  from: number,
  to: number,
}

type TokenAction<TokenType> = () => undefined | Token<TokenType> | Token<TokenType>[];

class Lexer<TokenType> {
  private tokens: Token<TokenType>[] = [];
  private rules: LexerRule<TokenType>[] = [];

  private index = 0;
  private input: string = "";

  defunct(chr: string) {
    throw new Error("Unexpected character at index " + (this.index - 1) + ": " + chr);
  }

  addRule(pattern: RegExp, action: TokenAction<TokenType>, start: number[] = [0]) {
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

    while (this.index <= this.input.length) {
      const matches = this.scan();

      matches.forEach(match => {
        this.index += length;

        const token = match.action(match.result);

        if (token !== undefined) {
          if (Array.isArray(token)) {
            this.tokens = token.slice(1);
            token = token[0];
          } else {
            return token;
          }
        }
      })

    }
  };


}

