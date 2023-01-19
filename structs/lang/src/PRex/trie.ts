export function nodetrie(val: string): trienode {
  return { char: val, kids: [], eow: false };
}
export type trienode = { char: string; kids: any[]; eow: boolean };

export class TRIE {
  root: null | trienode;
  alphabet: { [key: number]: { char: string; index: number } };
  alphabetSize: number;
  constructor(keys: string[]) {
    this.alphabet = {
      0: { char: '\u0000', index: 0 },
      97: { char: 'a', index: 1 },
      98: { char: 'b', index: 2 },
      99: { char: 'c', index: 3 },
      100: { char: 'd', index: 4 },
      101: { char: 'e', index: 5 },
      102: { char: 'f', index: 6 },
      103: { char: 'g', index: 7 },
      104: { char: 'h', index: 8 },
      105: { char: 'i', index: 9 },
      106: { char: 'j', index: 10 },
      107: { char: 'k', index: 11 },
      108: { char: 'l', index: 12 },
      109: { char: 'm', index: 13 },
      110: { char: 'n', index: 14 },
      111: { char: 'o', index: 15 },
      112: { char: 'p', index: 16 },
      113: { char: 'q', index: 17 },
      114: { char: 'r', index: 18 },
      115: { char: 's', index: 19 },
      116: { char: 't', index: 20 },
      117: { char: 'u', index: 21 },
      118: { char: 'v', index: 22 },
      119: { char: 'w', index: 23 },
      120: { char: 'x', index: 24 },
      121: { char: 'y', index: 25 },
      122: { char: 'z', index: 26 },
    };
    this.root = null;
    this.alphabetSize = 27;
    if (keys.length !== 0) {
      let L: null | number = keys.length;
      for (let i = 0; i < L; i++) {
        this.insert(keys[i]);
      }
      L = null;
      return this;
    }
  }
  addGlyph(str: string) {
    const charCode = str.charCodeAt(0);
    this.alphabet[charCode] = { char: str[0], index: this.alphabetSize };
    this.alphabetSize++;
  }
  createNode(char: string) {
    const node = nodetrie(char);
    for (let i = 0; i < this.alphabetSize; i++) {
      node.kids[i] = null;
    }
    node.eow = false;
    return node;
  }
  has(word: string) {
    const L = word.length;
    if (this.root === null) return false;
    let tmp = this.root;
    for (let i = 0; i < L; ++i) {
      let idx =
        this.alphabet[word[i].charCodeAt(0)]?.index ||
        this.alphabet[word[i].toLocaleLowerCase().charCodeAt(0)]?.index;
      if (tmp.kids[idx] === null) return false;
      tmp = tmp.kids[idx];
    }
    return tmp.eow;
  }
  delete(word: string) {
    if (this.root === null) return null;
    let deleted = false;
    const del = (root: trienode | null, key: string, depth: number) => {
      if (root === null) return null;
      if (depth === key.length) {
        if (root.eow) root.eow = false;
        if (!this.hasChildren(root)) {
          deleted = true;
          root = null;
        }
        return root;
      }
      let idx =
        this.alphabet[word[depth].charCodeAt(0)]?.index ||
        this.alphabet[word[depth].toLocaleLowerCase().charCodeAt(0)]?.index;
      root.kids[idx] = del(root.kids[idx], key, depth + 1);
      if (deleted && !this.hasChildren(root) && root.eow === false) root = null;
      return root;
    };
    del(this.root, word, 0);
    return this;
  }
  hasChildren(n: trienode | null) {
    if (n === null) return false;
    for (let i = 0; i < this.alphabetSize; i++) {
      if (n.kids[i] !== null) return true;
    }
    return false;
  }
  insert(word: string) {
    if (this.root === null) {
      this.root = this.createNode('');
    }
    const L = word.length;
    let temp = this.root;
    for (let i = 0; i < L; ++i) {
      let index =
        this.alphabet[word[i].charCodeAt(0)]?.index ||
        this.alphabet[word[i].toLocaleLowerCase().charCodeAt(0)].index;
      if (temp.kids[index] === null) {
        temp.kids[index] = this.createNode(word[i]);
      }
      temp = temp.kids[index];
    }
    if (temp.eow) {
      return this;
    } else {
      temp.eow = true;
      return this;
    }
  }
  isLeaf(node: trienode) {
    return node.eow === true;
  }
  words() {
    let words: any = [];
    if (this.root === null) return words;
    const findWords = (word = '', node = this.root) => {
      if (node?.eow) words.push(word);
      for (let i = 0; i < this.alphabetSize; i++) {
        if (node && node.kids[i] !== null) {
          let child = node.kids[i];
          findWords(word + child.char, child);
        }
      }
    };
    findWords();
    return words;
  }
}

export const Trie = (keys: string[]) => new TRIE(keys);
