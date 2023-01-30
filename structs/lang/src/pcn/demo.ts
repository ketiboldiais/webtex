import { prex } from './index.js';

const input = `
1/8 + 1/2;
`;
const parsing = prex.parse(input);
// parsing.print();
// parsing.log();
// console.log(parsing);
// console.log(parsing.prog);
const result = parsing.interpret();
console.log(result);
