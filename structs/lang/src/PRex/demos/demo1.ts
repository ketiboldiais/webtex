import { display } from '../../utils/index.js';
import { PRex, parser } from '../index.js';

const input = `
let a = 2 / 4;
let b = 4 + 5;
let c = a * b;
`;

const result = PRex(input);
display(result);
// const ast = parser.parse(input)
// display(ast);
