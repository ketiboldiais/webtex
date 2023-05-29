import {uid} from "../aux";

export interface Typed<T extends Figure> {
  /** The type name for this renderable node. */
  type: FigType;
  /**
   * Sets the {@link Typed.type|type} for this
   * renderable node. Once set, this value
   * cannot be changed.
   */
  typed(name: FigType): this;
  
  /**
   * Returns true if this renderable node
   * is of the provided type.
   */
  isType(name: FigType): this is InstanceType<T>;
  
  /** The node’s unique id. */
  id: string;
  
  /**
   * Sets the node’s id.
   * This must be a unique value.
   */
  uid(value:string): this;
  
  /**
   * The node’s class name.
   */
  className?:string;

  /**
   * Sets the node’s class name.
   */
  classed(value:string): this;
  
  /**
   * Returns the node’s class name.
   * Defaults to:
   * 
   * ~~~
   * `weave-${typename}` 
   * ~~~
   * 
   * where `typename` is the node’s named {@link Typed.type}.
   */
  klasse(): string;
}

export function typed<NodeType extends Figure>(
  nodetype: NodeType
): And<NodeType, Typed<NodeType>> {
  class Typed extends nodetype {
    className?:string;
    type: FigType = "unknown";
    id: string=uid(5);
    typed(name: FigType) {
      if (this.type === "unknown") {
        this.type = name;
      }
      return this;
    }
    isType(typename: FigType): this is InstanceType<NodeType> {
      return this.type === typename;
    }
    uid(value:string) {
      this.id=value;
      return this;
    }
    classed(value:string) {
      this.className=value;
      return this;
    }

    klasse() {
      const type = this.type;
      return `weave-${type}`;
    }
    
  }
  return Typed;
}
