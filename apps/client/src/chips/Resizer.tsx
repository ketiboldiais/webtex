import { LexicalEditor } from "lexical";
import { nanoid } from "nanoid";
import { PointerEvent, useRef } from "react";
import { concat } from "src/util";
import docstyle from '../ui/styles/Editor.module.scss';
import {Conditioned} from "./Inputs";
function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

enum To {
  east = 1 << 0,
  north = 1 << 3,
  south = 1 << 1,
  west = 1 << 2,
}

type Position = {
  currentHeight: "inherit" | number;
  currentWidth: "inherit" | number;
  direction: number;
  isResizing: boolean;
  ratio: number;
  startHeight: number;
  startWidth: number;
  startX: number;
  startY: number;
};
interface ResizerProps {
  editor: LexicalEditor;
  buttonRef: { current: null | HTMLButtonElement };
  imageRef: { current: null | HTMLElement };
  maxWidth?: number;
  onResizeEnd: (width: "inherit" | number, height: "inherit" | number) => void;
  onResizeStart: () => void;
  setShowCaption: (show: boolean) => void;
  showCaption: boolean;
  captionsEnabled: boolean;
}
const resizerUID = nanoid(7);
export function Resizer({
  onResizeStart,
  onResizeEnd,
  buttonRef,
  imageRef,
  maxWidth,
  editor,
  showCaption,
  setShowCaption,
  captionsEnabled,
}: ResizerProps): JSX.Element {
  const controlWrapperRef = useRef<HTMLDivElement>(null);
  const userSelect = useRef({
    priority: "",
    value: "default",
  });
  const posref = useRef<Position>({
    currentHeight: 0,
    currentWidth: 0,
    direction: 0,
    isResizing: false,
    ratio: 0,
    startHeight: 0,
    startWidth: 0,
    startX: 0,
    startY: 0,
  });
  const editorRootElement = editor.getRootElement();
  const minWidth = 100;
  const minHeight = 100;
  const pad = 20;
  const maxWidthContainer = maxWidth
    ? maxWidth
    : editorRootElement !== null
    ? editorRootElement.getBoundingClientRect().width - pad
    : minWidth;
  const maxHeightContainer = editorRootElement !== null
    ? editorRootElement.getBoundingClientRect().height - pad
    : minHeight;
  const setStartCursor = (direction: number) => {
    const ew = direction === To.east || direction === To.west;
    const ns = direction === To.north || direction === To.south;
    const nwse = (direction & To.north && direction & To.west) ||
      (direction & To.south && direction & To.east);

    const cursorDir = ew ? "ew" : ns ? "ns" : nwse ? "nwse" : "nesw";

    if (editorRootElement !== null) {
      editorRootElement.style.setProperty(
        "cursor",
        `${cursorDir}-resize`,
        "important",
      );
    }
    if (document.body !== null) {
      document.body.style.setProperty(
        "cursor",
        `${cursorDir}-resize`,
        "important",
      );
      userSelect.current.value = document.body.style.getPropertyValue(
        "-webkit-user-select",
      );
      userSelect.current.priority = document.body.style.getPropertyPriority(
        "-webkit-user-select",
      );
      document.body.style.setProperty(
        "-webkit-user-select",
        `none`,
        "important",
      );
    }
  };

  const setEndCursor = () => {
    if (editorRootElement === null || document.body === null) return;
    editorRootElement.style.setProperty("cursor", "default");
    document.body.style.setProperty("cursor", "default");
    document.body.style.setProperty(
      "-webkit-user-select",
      userSelect.current.value,
      userSelect.current.priority,
    );
  };

  const handlePointerDown = (
    event: PointerEvent<HTMLDivElement>,
    direction: number,
  ) => {
    if (!editor.isEditable()) return;
    const image = imageRef.current;
    const controlWrapper = controlWrapperRef.current;
    if (image === null || controlWrapper === null) return;
    const { width, height } = image.getBoundingClientRect();
    const pos = posref.current;
    pos.startWidth = width;
    pos.startHeight = height;
    pos.ratio = width / height;
    pos.currentWidth = width;
    pos.currentHeight = height;
    pos.startX = event.clientX;
    pos.startY = event.clientY;
    pos.isResizing = true;
    pos.direction = direction;
    setStartCursor(direction);
    onResizeStart();
    controlWrapper.classList.add(docstyle.image_control_wrapper_resizing);
    image.style.height = `${height}px`;
    image.style.width = `${width}px`;
    document.addEventListener("pointermove", handlePointerMove as any);
    document.addEventListener("pointerup", handlePointerUp);
  };
  const handlePointerMove = (event: PointerEvent) => {
    const image = imageRef.current;
    const pos = posref.current;
    const isHorizontal = pos.direction &
      (To.east | To.west);
    const isVertical = pos.direction &
      (To.south | To.north);
    if (image === null || !pos.isResizing) return;
    let diff = Math.floor(pos.startX - event.clientX);
    if (isVertical && !isHorizontal) {
      diff = Math.floor(pos.startY - event.clientY);
      diff = pos.direction & To.south ? -diff : diff;
      const height = clamp(
        pos.startHeight + diff,
        minHeight,
        maxHeightContainer,
      );
      image.style.height = `${height}px`;
      pos.currentHeight = height;
      return;
    }
    diff = pos.direction & To.east ? -diff : diff;
    const width = clamp(
      pos.startWidth + diff,
      minWidth,
      maxWidthContainer,
    );
    pos.currentWidth = width;
    image.style.width = `${width}px`;
    if (isVertical) {
      const height = width / pos.ratio;
      image.style.height = `${height}px`;
      pos.currentHeight = height;
    }
  };
  const handlePointerUp = () => {
    const image = imageRef.current;
    const pos = posref.current;
    const controlWrapper = controlWrapperRef.current;
    if (image === null) return;
    if (controlWrapper === null) return;
    if (!pos.isResizing) return;
    const width = pos.currentWidth;
    const height = pos.currentHeight;
    pos.startWidth = 0;
    pos.startHeight = 0;
    pos.ratio = 0;
    pos.startX = 0;
    pos.startY = 0;
    pos.currentWidth = 0;
    pos.currentHeight = 0;
    pos.isResizing = false;
    controlWrapper.classList.remove(docstyle.image_control_wrapper_resizing);
    setEndCursor();
    onResizeEnd(width, height);
    document.removeEventListener("pointermove", handlePointerMove as any);
    document.removeEventListener("pointerup", handlePointerUp);
  };

  const C = (subclass: string) => concat(docstyle.resizer, subclass);
  const recap = () => setShowCaption(!showCaption);
  const move = (dir: number) => (event: PointerEvent<HTMLDivElement>) =>
    handlePointerDown(event, dir);
  const handleSpec = [
    { css: C(docstyle.n), action: move(To.north) },
    { css: C(docstyle.ne), action: move(To.north | To.east) },
    { css: C(docstyle.e), action: move(To.east) },
    { css: C(docstyle.se), action: move(To.south | To.east) },
    { css: C(docstyle.s), action: move(To.south) },
    { css: C(docstyle.sw), action: move(To.south | To.west) },
    { css: C(docstyle.w), action: move(To.west) },
    { css: C(docstyle.nw), action: move(To.north | To.west) },
  ];
  const shouldShowButton = !showCaption && captionsEnabled;
  return (
    <div ref={controlWrapperRef}>
      <Conditioned on={shouldShowButton}>
        <button className={docstyle.image_caption_button} ref={buttonRef} onClick={recap}>
          Add Caption
        </button>
      </Conditioned>
      {handleSpec.map((spec, i) => (
        <div
          className={spec.css}
          onPointerDown={spec.action}
          key={concat(resizerUID, i)}
        />
      ))}
    </div>
  );
}
