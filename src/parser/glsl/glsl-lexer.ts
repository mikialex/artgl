enum GLSLToken{
  float,
}

export const lexer = new Lexer<GLSLToken>()
  .addRule(/[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)/, () => GLSLToken.float)