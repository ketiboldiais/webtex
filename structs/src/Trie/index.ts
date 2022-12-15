import { ASCII } from "../Utils/asciiTable";
import { TrieNode } from "./trie.api";

export const trieNode = (val: string): TrieNode => {
  return { char: val, children: [], eow: false };
};

export class Trie {
  root: null;
  alphabetSize: number;
  alphabet: { [key: number]: { char: string; index: number } };
  constructor(keys?: string[]) {
    this.alphabet = ASCII;
    this.root = null;
    this.alphabetSize = 95;
  }
  registerChar(char: string) {
    const charCode = char.charCodeAt(0);
    this.alphabet[charCode] = { char: char[0], index: this.alphabetSize };
    this.alphabetSize += 1;
    return this;
  }
  createNode(char: string) {
    const node = trieNode(char);
    for (let i = 0; i < this.alphabetSize; i++) {
      node.children[i] = null;
    }
    node.eow = false;
    return node;
  }
}
