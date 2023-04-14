import { Html } from "src/util";

export function getCellID(domElement: Html) {
  let node: null | Html = domElement;
  while (node !== null) {
    const pid = node.getAttribute("data-id");
    if (pid !== null) {
      return pid;
    }
    node = node.parentElement;
  }
  return null;
}

export function targetOnControl(target: Html) {
  let node: null | Html = target;
  while (node !== null) {
    switch (node.nodeName) {
      case "BUTTON":
      case "INPUT":
      case "TEXTAREA":
        return true;
    }
    node = node.parentElement;
  }
  return false;
}
