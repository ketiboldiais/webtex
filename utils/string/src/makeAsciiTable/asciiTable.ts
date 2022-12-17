const lowerAlpha = "abcdefghijklmnopqrstuvwxyz";
const upperAlpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const numbers = "0123456789";
const symbols = `!"#$%&'()*+,-./:;<=>?@[\\]^_\`{|}~`;

const generateTable = () => {
  let i = 0;
  let tbl: any = {};
  tbl[i] = { char: String.fromCharCode(0), index: 0 };
	i++;
  for (let lower of lowerAlpha) {
    tbl[lower.charCodeAt(0)] = { char: lower, index: i };
    i++;
  }
  for (let upper of upperAlpha) {
    tbl[upper.charCodeAt(0)] = { char: upper, index: i };
    i++;
  }
  for (let num of numbers) {
    tbl[num.charCodeAt(0)] = { char: num, index: i };
    i++;
  }
  for (let sym of symbols) {
    tbl[sym.charCodeAt(0)] = { char: sym, index: i };
    i++;
  }
  return tbl;
};

const table = generateTable();


export const ASCII = {
  0: { char: "\u0000", index: 0 },
  33: { char: "!", index: 63 },
  34: { char: '"', index: 64 },
  35: { char: "#", index: 65 },
  36: { char: "$", index: 66 },
  37: { char: "%", index: 67 },
  38: { char: "&", index: 68 },
  39: { char: "'", index: 69 },
  40: { char: "(", index: 70 },
  41: { char: ")", index: 71 },
  42: { char: "*", index: 72 },
  43: { char: "+", index: 73 },
  44: { char: ",", index: 74 },
  45: { char: "-", index: 75 },
  46: { char: ".", index: 76 },
  47: { char: "/", index: 77 },
  48: { char: "0", index: 53 },
  49: { char: "1", index: 54 },
  50: { char: "2", index: 55 },
  51: { char: "3", index: 56 },
  52: { char: "4", index: 57 },
  53: { char: "5", index: 58 },
  54: { char: "6", index: 59 },
  55: { char: "7", index: 60 },
  56: { char: "8", index: 61 },
  57: { char: "9", index: 62 },
  58: { char: ":", index: 78 },
  59: { char: ";", index: 79 },
  60: { char: "<", index: 80 },
  61: { char: "=", index: 81 },
  62: { char: ">", index: 82 },
  63: { char: "?", index: 83 },
  64: { char: "@", index: 84 },
  65: { char: "A", index: 27 },
  66: { char: "B", index: 28 },
  67: { char: "C", index: 29 },
  68: { char: "D", index: 30 },
  69: { char: "E", index: 31 },
  70: { char: "F", index: 32 },
  71: { char: "G", index: 33 },
  72: { char: "H", index: 34 },
  73: { char: "I", index: 35 },
  74: { char: "J", index: 36 },
  75: { char: "K", index: 37 },
  76: { char: "L", index: 38 },
  77: { char: "M", index: 39 },
  78: { char: "N", index: 40 },
  79: { char: "O", index: 41 },
  80: { char: "P", index: 42 },
  81: { char: "Q", index: 43 },
  82: { char: "R", index: 44 },
  83: { char: "S", index: 45 },
  84: { char: "T", index: 46 },
  85: { char: "U", index: 47 },
  86: { char: "V", index: 48 },
  87: { char: "W", index: 49 },
  88: { char: "X", index: 50 },
  89: { char: "Y", index: 51 },
  90: { char: "Z", index: 52 },
  91: { char: "[", index: 85 },
  92: { char: "\\", index: 86 },
  93: { char: "]", index: 87 },
  94: { char: "^", index: 88 },
  95: { char: "_", index: 89 },
  96: { char: "`", index: 90 },
  97: { char: "a", index: 1 },
  98: { char: "b", index: 2 },
  99: { char: "c", index: 3 },
  100: { char: "d", index: 4 },
  101: { char: "e", index: 5 },
  102: { char: "f", index: 6 },
  103: { char: "g", index: 7 },
  104: { char: "h", index: 8 },
  105: { char: "i", index: 9 },
  106: { char: "j", index: 10 },
  107: { char: "k", index: 11 },
  108: { char: "l", index: 12 },
  109: { char: "m", index: 13 },
  110: { char: "n", index: 14 },
  111: { char: "o", index: 15 },
  112: { char: "p", index: 16 },
  113: { char: "q", index: 17 },
  114: { char: "r", index: 18 },
  115: { char: "s", index: 19 },
  116: { char: "t", index: 20 },
  117: { char: "u", index: 21 },
  118: { char: "v", index: 22 },
  119: { char: "w", index: 23 },
  120: { char: "x", index: 24 },
  121: { char: "y", index: 25 },
  122: { char: "z", index: 26 },
  123: { char: "{", index: 91 },
  124: { char: "|", index: 92 },
  125: { char: "}", index: 93 },
  126: { char: "~", index: 94 },
};
