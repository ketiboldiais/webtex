import app from "../ui/styles/App.module.scss";
import { Excalidraw, exportToSvg } from "@excalidraw/excalidraw";
import { Button } from "./Inputs";
import { Modal } from "@hooks/useModal";
import { SVG_REF } from "src/App";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import { mergeRegister } from "@lexical/utils";
import _default from "@matejmazur/react-katex";
import {
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  CLICK_COMMAND,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  NodeKey,
} from "lexical";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { HTML_BUTTON_REF, HTML_DIV_REF, HTML_IMG_REF } from "src/App";
import { command, concat } from "src/util";
import { $isExcalidrawNode } from "./Draw";
import { Resizer } from "./Resizer";
import {
  ExcalidrawElement,
  NonDeleted,
} from "@excalidraw/excalidraw/types/element/types";
import { AppState } from "@excalidraw/excalidraw/types/types";

type excalidraw_component_props = {
  nodeKey: NodeKey;
  data: string;
};

export default function ExcalidrawComponent(
  { nodeKey, data }: excalidraw_component_props,
) {
  const [editor] = useLexicalComposerContext();
  const [isModalOpen, setModalOpen] = useState(
    data === "[]" && editor.isEditable(),
  );
  const imageContainerRef = useRef<HTML_IMG_REF>(null);
  const btnRef = useRef<HTML_BUTTON_REF>(null);
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(
    nodeKey,
  );
  const [isResizing, setIsResizing] = useState(false);
  const onDelete = useCallback((event: KeyboardEvent) => {
    if (!isSelected) return false;
    if (!$isNodeSelection($getSelection())) return false;
    event.preventDefault();
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isExcalidrawNode(node)) node.remove();
      setSelected(false);
    });
    return false;
  }, [editor, isSelected, nodeKey, setSelected]);

  useEffect(() => {
    if (isModalOpen) {
      editor.setEditable(false);
    } else {
      editor.setEditable(true);
    }
  }, [isModalOpen, editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        ...command.priority.low(CLICK_COMMAND, (event: MouseEvent) => {
          const buttonElem = btnRef.current;
          const eventTarget = event.target;

          if (isResizing) {
            return true;
          }

          if (buttonElem !== null && buttonElem.contains(eventTarget as Node)) {
            if (!event.shiftKey) {
              clearSelection();
            }
            setSelected(!isSelected);
            if (event.detail > 1) {
              setModalOpen(true);
            }
            return true;
          }

          return false;
        }),
      ),
      editor.registerCommand(
        ...command.priority.low(KEY_DELETE_COMMAND, onDelete),
      ),
      editor.registerCommand(
        ...command.priority.low(KEY_BACKSPACE_COMMAND, onDelete),
      ),
    );
  }, [clearSelection, editor, isSelected, isResizing, onDelete, setSelected]);
  const deleteNode = useCallback(() => {
    setModalOpen(false);
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isExcalidrawNode(node)) {
        node.remove();
      }
    });
    return true;
  }, [editor, nodeKey]);

  const setData = (newData: ReadonlyArray<ExcalidrawElementFragment>) => {
    if (!editor.isEditable()) {
      return;
    }
    return editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isExcalidrawNode(node)) {
        if (newData.length > 0) {
          node.setData(JSON.stringify(newData));
        } else {
          node.remove();
        }
      }
    });
  };
  const onResizeStart = () => {
    setIsResizing(true);
  };

  const onResizeEnd = () => {
    // Delay hiding the resize bars for click case
    setTimeout(() => {
      setIsResizing(false);
    }, 200);
  };

  const elements = useMemo(() => JSON.parse(data), [data]);

  return (
    <>
      <ExcalidrawModal
        initialElements={elements}
        isShown={isModalOpen}
        onDelete={deleteNode}
        onSave={(newData) => {
          editor.setEditable(true);
          setData(newData);
          setModalOpen(false);
        }}
        closeOnClickOutside={true}
      />
      {elements.length > 0 && (
        <button
          ref={btnRef}
          className={`${app.draw_button} ${isSelected ? "selected" : ""}`}
        >
          <ExcalidrawImage
            imageContainerRef={imageContainerRef}
            className="image"
            elements={elements}
          />
          {(isSelected || isResizing) && (
            <Resizer
              showCaption={true}
              setShowCaption={() => null}
              imageRef={imageContainerRef}
              editor={editor}
              onResizeStart={onResizeStart}
              onResizeEnd={onResizeEnd}
              buttonRef={{ current: null }}
              captionsEnabled={false}
            />
          )}
        </button>
      )}
    </>
  );
}

export function ExcalidrawModal({
  closeOnClickOutside = false,
  onSave,
  initialElements,
  isShown = false,
  onDelete,
}: excalidraw_modal_props) {
  const excaliDrawModelRef = useRef<HTML_DIV_REF>(null);
  const [discardModalOpened, openDiscardModal] = useState(false);
  const [elements, setElements] = useState<initial_excalidraw_elements>(
    initialElements,
  );
  useEffect(() => {
    if (excaliDrawModelRef.current !== null) {
      excaliDrawModelRef.current.focus();
    }
  }, []);
  useEffect(() => {
    let modalOverlayElement: HTMLElement | null = null;
    const outClickHandler = (event: MouseEvent) => {
      const target = event.target;
      if (
        excaliDrawModelRef.current !== null &&
        !excaliDrawModelRef.current.contains(target as Node) &&
        closeOnClickOutside
      ) {
        onDelete();
      }
    };
    if (excaliDrawModelRef.current !== null) {
      modalOverlayElement = excaliDrawModelRef.current?.parentElement;
      if (modalOverlayElement !== null) {
        modalOverlayElement?.addEventListener("click", outClickHandler);
      }
    }
    return () => {
      if (modalOverlayElement !== null) {
        modalOverlayElement.removeEventListener("click", outClickHandler);
      }
    };
  }, [closeOnClickOutside, onDelete]);

  useLayoutEffect(() => {
    const currentModalRef = excaliDrawModelRef.current;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onDelete();
      }
    };
    if (currentModalRef !== null) {
      currentModalRef.addEventListener("keydown", onKeyDown);
    }
    return () => {
      if (currentModalRef !== null) {
        currentModalRef.removeEventListener("keydown", onKeyDown);
      }
    };
  }, [elements, onDelete]);

  const save = () => {
    if (elements.filter((el) => !el.isDeleted).length > 0) {
      onSave(elements);
    } else {
      onDelete();
    }
  };

  const discard = () => {
    if (elements.filter((el) => !el.isDeleted).length === 0) {
      onDelete();
    } else {
      openDiscardModal(true);
    }
  };

  function ShowDiscardDialog() {
    return (
      <Modal
        onClose={() => openDiscardModal(false)}
        closeOnClickOutside={true}
      >
        <span>Discard changes?</span>
        <Button
          label={"Discard"}
          click={() => {
            openDiscardModal(false);
            onDelete();
          }}
        />
        <Button label={"Cancel"} click={() => openDiscardModal(false)} />
      </Modal>
    );
  }
  if (isShown === false) {
    return null;
  }
  const onChange = (es: initial_excalidraw_elements) => setElements(es);
  const EXCALIDRAW: any = Excalidraw.$$typeof != null ? Excalidraw : _default;
  return createPortal(
    <div className={app.draw_modal_overlay}>
      <div
        className={app.draw_modal_box}
        ref={excaliDrawModelRef}
        tabIndex={-1}
      >
        <div className={app.draw_modal_row}>
          {discardModalOpened && <ShowDiscardDialog />}
          <EXCALIDRAW
            onChange={onChange}
            initialData={{
              appState: { isLoading: false },
              elements: initialElements,
            }}
          />
          <div className={app.draw_modal_actions}>
            <Button
              className={app.modal_close_button}
              click={discard}
            />
            <Button
              className={app.draw_save_button}
              click={save}
              label={"Save"}
            />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

type ExcalidrawElementFragment = {
  isDeleted?: boolean;
};
type initial_excalidraw_elements = ReadonlyArray<ExcalidrawElementFragment>;
interface excalidraw_modal_props {
  closeOnClickOutside?: boolean;
  initialElements: initial_excalidraw_elements;
  isShown?: boolean;
  onDelete: VoidFunction;
  onSave: (elements: initial_excalidraw_elements) => void;
}

type ImageType = "svg" | "canvas";
interface excalidraw_image_props {
  appState?: Partial<Omit<AppState, "offsetTop" | "offsetLeft">> | null;
  className?: string;
  elements: NonDeleted<ExcalidrawElement>[];
  height?: number | null;
  imageContainerRef: { current: HTML_DIV_REF };
  imageType?: ImageType;
  width?: number | null;
}

export function ExcalidrawImage({
  elements,
  imageContainerRef,
  appState = null,
}: excalidraw_image_props) {
  const [Svg, setSvg] = useState<SVG_REF>(null);
  useEffect(() => {
    const setContent = async () => {
      const svg: SVGElement = await exportToSvg({
        elements,
        files: null,
      });
      unstyleSVG(svg);
      svg.setAttribute("width", "100%");
      svg.setAttribute("height", "100%");
      svg.setAttribute("display", "block");
      setSvg(svg);
    };
    setContent();
  }, [elements, appState]);
  return (
    <div
      ref={imageContainerRef}
      className={app.draw_canvas}
      dangerouslySetInnerHTML={{ __html: Svg?.outerHTML ?? "" }}
    />
  );
}
function unstyleSVG(svg: SVGElement) {
  const styleTag = svg?.firstElementChild?.firstElementChild;
  const viewbox = svg.getAttribute("viewbox");
  if (viewbox !== null) {
    const viewboxDyDx = viewbox.split(" ");
    svg.setAttribute("width", viewboxDyDx[2]);
    svg.setAttribute("height", viewboxDyDx[3]);
  }
  if (styleTag && styleTag.tagName === "style") {
    styleTag.remove();
  }
}
