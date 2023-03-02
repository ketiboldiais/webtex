type Alphabet = (string|null)[];

class Trienode {
  char: string;
  children: (string | null)[];
  eow: boolean;
  constructor(char: string, eow: boolean) {
    this.char = char;
    this.children = new Array(52).fill(null);
    this.eow = eow;
  }
}

class Trie {
  alphabet: Alphabet;
  idx(c: string) {
    return (c.match(/^[a-z]/))
      ? ((122 - c.charCodeAt(0)) % 26)
      : (c.match(/^[A-Z]/)) ? ((90 - c.charCodeAt(0)) % 26) + 26
			: 52;
  }
  constructor() {
    this.alphabet = [
      "z", "y", "x", "w", "v", "u", "t", "s", "r", "q", "p",
      "o", "n", "m", "l", "k", "j", "i", "h", "g", "f", "e",
      "d", "c", "b", "a", "Z", "Y", "X", "W", "V", "U", "T",
      "S", "R", "Q", "P", "O", "N", "M", "L", "K", "J", "I",
      "H", "G", "F", "E", "D", "C", "B", "A", null
    ];
  }
}



