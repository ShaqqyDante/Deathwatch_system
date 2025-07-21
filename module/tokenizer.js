export const TokenTypes = {
  NUMBER: 'NUMBER',
  IDENTIFIER: 'IDENTIFIER',
  SPACE:'SPACE',
  ADDITION: '+',
  SUBTRACTION: '-',
  MULTIPLICATION: '*',
  DIVISION: '/',
  EXPONENTIATION: '^',
  PARENTHESIS_LEFT: '(',
  PARENTHESIS_RIGHT: ')',
  COMMA:','
};

const TokenSpec = [
  [/^\s+/,TokenTypes.SPACE],
  [/^\,/, TokenTypes.COMMA],
  [/^(?:\d+(?:\.\d*)?|\.\d+)/, TokenTypes.NUMBER],
  [/^[a-z]+/, TokenTypes.IDENTIFIER],
  [/^\+/, TokenTypes.ADDITION],
  [/^\-/, TokenTypes.SUBTRACTION],
  [/^\*/, TokenTypes.MULTIPLICATION],
  [/^\//, TokenTypes.DIVISION],
  [/^\^/, TokenTypes.EXPONENTIATION],
  [/^\(/, TokenTypes.PARENTHESIS_LEFT],
  [/^\)/, TokenTypes.PARENTHESIS_RIGHT]
  
];

export class Tokenizer {
  constructor(input) {
    this.input = input;
    this.cursor = 0;
  }

  hasMoreTokens() {
    return this.cursor < this.input.length;
  }

  match(regex, inputSlice) {
    const matched = regex.exec(inputSlice);
    if (matched === null) {
      return null;
    }

    this.cursor += matched[0].length;
    return matched[0];
  }

  getNextToken() {
    if (!this.hasMoreTokens()) {
      return null;
    }
  try{  
    const inputSlice = this.input.slice(this.cursor);

    for (let [regex, type] of TokenSpec) {
      const tokenValue = this.match(regex, inputSlice);

      // No rule was matched!
      if (tokenValue === null) {
        continue;
      }

      // Skip whitespace!
//      if (type === null) {
//        return this.getNextToken();
//      }

      return {
        type,
        value: tokenValue,
      };
    }
    }
    catch(err){
      console.error('getNextToken', err.message);
      
    }
    throw new SyntaxError(`Unexpected token: "${inputSlice[0]}"`);
  }

  printAllTokens() {
    let token;
    while ((token = this.getNextToken())) {
      console.log(token);
    }
  }
}




