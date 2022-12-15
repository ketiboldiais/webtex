/**
 * @description A node with one next pointer.
 * @property data
 * - The data stored by the node.
 * @property next
 * - The `Node` pointed to by the node.
 */
type NODE = {
  data: any;
  next: NODE | null;
};

/**
 * @description Creates a new `NODE`.
 */
export const node = (data: any): NODE => {
  return { data, next: null };
};
