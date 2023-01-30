import { prex } from './index.js';

const input = `
let j(x) := n(x + 5);
const k := j(5) + 10;
`;
const parsing = prex.parse(input);
parsing.print();
// parsing.log();
// console.log(parsing);
// console.log(parsing.prog);
// const result = parsing.interpret();
// display(result);
