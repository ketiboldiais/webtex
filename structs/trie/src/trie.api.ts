export type TrieNodeChildren = (string | null)[];
export interface TrieNode {
  char: string;
  children: TrieNodeChildren;
  eow: boolean;
}


