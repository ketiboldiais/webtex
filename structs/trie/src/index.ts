import { ASCII } from "../../../utils/string/src/makeAsciiTable/asciiTable";
import { TrieNode } from "./trie.api";

export const trieNode = (val: string): TrieNode => {
  return { char: val, children: [], eow: false };
};

interface TrieAPI {
  root: TrieNode | null;
  alphaSize: number;
  alphabet: { [key: number]: { char: string; index: number } };
  registerChar: (char: string) => Trie;
  createNode: (char: string) => TrieNode;
}

export class Trie implements TrieAPI {
  root: null;
  alphaSize: number;
  alphabet: { [key: number]: { char: string; index: number } };
  constructor(keys?: string[]) {
    this.alphabet = ASCII;
    this.root = null;
    this.alphaSize = 95;
  }
  registerChar(char: string) {
    const charCode = char.charCodeAt(0);
    this.alphabet[charCode] = { char: char[0], index: this.alphaSize };
    this.alphaSize += 1;
    return this;
  }
  createNode(char: string) {
    const node = trieNode(char);
    for (let i = 0; i < this.alphaSize; i++) {
      node.children[i] = null;
    }
    node.eow = false;
    return node;
  }
}
