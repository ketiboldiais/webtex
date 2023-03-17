import { tree } from "./stringfn.js";

class CharNode {
  key: string;
  parent: CharNode | null;
  children: { [key: string]: CharNode };
  eow: boolean = false;
  constructor(key = "") {
    this.key = key;
    this.parent = null;
    this.children = {};
  }
  has(char: string) {
    return this.children[char] !== undefined;
  }
  set isWord(value: boolean) {
    this.eow = value;
  }
  get isWord() {
    return this.eow === true;
  }
  get isLeaf() {
    return Object.keys(this.children).length === 0;
  }
  get hasChildren() {
    return Object.keys(this.children).length > 0;
  }
  setParent(key: string, node: CharNode) {
    this.children[key].parent = node;
    return this;
  }
  addChild(char: string) {
    this.children[char] = new CharNode(char);
    return this;
  }
  getChild(char: string) {
    if (this.children[char]) {
      return this.children[char];
    }
    return null;
  }
  getWord() {
    let output = [];
    let node: CharNode | null = this;
    while (node !== null) {
      output.unshift(node.key);
      node = node.parent;
    }
    return output.join("");
  }
  hasWord(word: string) {
    return this.getWord() === word;
  }
}

export class Trie {
  root: CharNode;
  constructor() {
    this.root = new CharNode();
  }
  /**
   * Adds the given word to the trie.
   * Returns `this`.
   */
  add(word: string): this {
    let current = this.root;
    for (let i = 0; i < word.length; i++) {
      let char = word[i];
      if (!current.has(char)) {
        current.addChild(char);
        current.setParent(char, current);
      }
      current = current.children[char];
    }
    current.eow = true;
    return this;
  }
  get stringTree() {
    return tree(this);
  }
  /**
   * Returns true if the given
   * word exists in the trie,
   * false otherwise.
   */
  has(word: string) {
    let current = this.root;
    for (let i = 0; i < word.length; i++) {
      let char = word[i];
      if (current.has(char)) {
        current = current.children[char];
      } else return false;
    }
    return current.isWord;
  }
  /**
   * Deletes the word in the trie.
   * Returns an empty string if
   * the word does not exist in the
   * trie. Otherwise, returns the
   * word deleted.
   */
  del(word: string) {
    let root = this.root;
    if (!word) return;
    const remove = (node: CharNode, word: string) => {
      if (node.eow && node.hasWord(word)) {
        if (node.hasChildren) node.eow = false;
        else node.parent!.children = {};
        return true;
      }
      for (let key in node.children) remove(node.children[key], word);
      return false;
    };
    remove(root, word);
  }
  /**
   * Returns all the words that
   * start with the given prefix.
   */
  startsWith(prefix: string): string[] {
    let current = this.root;
    let output: string[] = [];
    const findWords = (node: CharNode, array: string[]) => {
      if (node.eow) array.unshift(node.getWord());
      for (let child in node.children) {
        findWords(node.children[child], array);
      }
    };
    for (let i = 0; i < prefix.length; i++) {
      if (current.has(prefix[i])) {
        current = current.children[prefix[i]];
      } else return output;
    }
    findWords(current, output);
    return output;
  }

  /**
   * Inserts an array of words into the trie.
   */
  insert(words: string[]) {
    for (let i = 0; i < words.length; i++) {
      this.add(words[i]);
    }
    return this;
  }
  static of(words: string[]) {
    const trie = new Trie().insert(words);
    return trie;
  }
}
