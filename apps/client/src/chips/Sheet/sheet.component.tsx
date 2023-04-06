type NSTR = string | null;
import styles from "../../ui/styles/Editor.module.scss";
import app from "../../ui/styles/App.module.scss";
import { $generateHtmlFromNodes } from "@lexical/html";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalNestedComposer } from "@lexical/react/LexicalNestedComposer";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import {
  $addUpdateTag,
  $createParagraphNode,
  $getNodeByKey,
  $getRoot,
  $getSelection,
  $isNodeSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  COPY_COMMAND,
  createEditor,
  CUT_COMMAND,
  EditorThemeClasses,
  Klass,
  LexicalCommand,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  PASTE_COMMAND,
} from "lexical";
import {
  createContext,
  Dispatch,
  ForwardedRef,
  forwardRef,
  MutableRefObject,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Cell,
  cloneCell,
  htmlCache,
  newRow,
  Row,
  Rows,
  textCache,
} from "./sheet.aux";
import {
  concat,
  IS_APPLE,
  joinRest,
  KBCom,
  KEYCODE,
  KeyName,
  toggle,
} from "src/util";
import { $isSpreadsheetNode, SpreadsheetNode } from "./sheet.node";
import { Conditioned, Ternary } from "../Inputs";
import { HTML_DIV_REF } from "src/App";
import { AND, uid } from "src/algom";
import { Dropdown } from "../Dropdown";
import { Chevron } from "../Icon";
import { Option } from "../Dropdown";
import { useEditor } from "@hooks/useEditor";
import { mergeRegister } from "@lexical/utils";
import { useAppDispatch } from "src/state/state";

function focusCell(tableElem: HTMLElement, id: string): void {
  const cellElem = tableElem.querySelector(`[data-id=${id}]`) as HTMLElement;
  if (cellElem == null) {
    return;
  }
  cellElem.focus();
}

function generateHTMLFromJSON(
  editorStateJSON: string,
  cellEditor: LexicalEditor,
): string {
  const editorState = cellEditor.parseEditorState(editorStateJSON);
  let html = htmlCache.get(editorStateJSON);
  if (html === undefined) {
    html = editorState.read(() => $generateHtmlFromNodes(cellEditor, null));
    const textContent = editorState.read(() => $getRoot().getTextContent());
    htmlCache.set(editorStateJSON, html);
    textCache.set(editorStateJSON, textContent);
  }
  return html;
}

type Html = HTMLElement;

const { min, max } = Math;

const HISTORY_PUSH = "history-push";
const ATTR_DATA_ID = "data-id";
const ATTR_DATA_RESIZE = "data-table-resize";

type KeyChecker = (
  target: KEYCODE,
) => (
  keycode: number,
  shiftKey: boolean,
  metaKey: boolean,
  ctrlKey: boolean,
) => boolean;

const isShortCutOn: KeyChecker =
  (target) => (keycode, shiftKey, metaKey, ctrlKey) => {
    if (shiftKey) return false;
    if (keycode === target) {
      return IS_APPLE ? metaKey : ctrlKey;
    }
    return false;
  };

const isCopy = isShortCutOn(KEYCODE.C_KEY);
const isCut = isShortCutOn(KEYCODE.X_KEY);
const isPaste = isShortCutOn(KEYCODE.V_KEY);

const isResizing = (target: Html) =>
  target.nodeType === 1 && target.hasAttribute(ATTR_DATA_RESIZE);

const emptyParagraph = (theme: EditorThemeClasses) =>
  `<p class="${theme.paragraph}"><br></p>`;

type Rect = {
  startX: number;
  endX: number;
  startY: number;
  endY: number;
};

const rectBounds = (
  startPos: CellPosition,
  endPos: CellPosition,
): Rect => {
  const startX = min(
    startPos.columnIndex,
    endPos.columnIndex,
  );
  const endX = max(
    startPos.columnIndex,
    endPos.columnIndex,
  );
  const startY = min(
    startPos.rowIndex,
    endPos.rowIndex,
  );
  const endY = max(
    startPos.rowIndex,
    endPos.rowIndex,
  );
  return {
    startX,
    endX,
    startY,
    endY,
  };
};

const getCellID = (element: HTMLElement) => {
  let node: null | HTMLElement = element;
  while (node !== null) {
    const pid = node.getAttribute(ATTR_DATA_ID);
    if (pid != null) {
      return pid;
    }
    node = node.parentElement;
  }
  return null;
};

const targetOnUI = (target: HTMLElement) => {
  let node: null | HTMLElement = target;
  while (node !== null) {
    const { nodeName } = node;
    switch (nodeName) {
      case "BUTTON":
      case "INPUT":
      case "TEXTAREA":
        return true;
    }
    node = node.parentElement;
  }
  return false;
};

const getCellWidth = (element: HTMLElement) => {
  let node: null | HTMLElement = element;
  while (node !== null) {
    const { nodeName } = node;
    if (nodeName === "TH" || nodeName === "TD") {
      return node.getBoundingClientRect().width;
    }
    node = node.parentElement;
  }
  return 0;
};

export type CellEditorConfig = {
  namespace: string;
  nodes: ReadonlyArray<Klass<LexicalNode>>;
  onError: (error: Error, editor: LexicalEditor) => void;
  theme: EditorThemeClasses;
  readOnly?: boolean;
};

export type SSCtx = {
  config: null | CellEditorConfig;
  plugins: null | JSX.Element | Array<JSX.Element>;
  set: (
    config: null | CellEditorConfig,
    plugins: null | JSX.Element | Array<JSX.Element>,
  ) => void;
};

export const SpreadsheetContext = createContext<SSCtx>({
  config: null,
  plugins: null,
  set: () => {},
});

type PartialSheetContext = Pick<SSCtx, "config" | "plugins">;

export function SheetContext({ children }: { children: JSX.Element }) {
  const [
    contextValue,
    setContextValue,
  ] = useState<PartialSheetContext>({ config: null, plugins: null });

  return (
    <SpreadsheetContext.Provider
      value={useMemo(() => ({
        config: contextValue.config,
        plugins: contextValue.plugins,
        set: (config, plugins) => {
          setContextValue({ config, plugins });
        },
      }), [contextValue.config, contextValue.plugins])}
    >
      {children}
    </SpreadsheetContext.Provider>
  );
}
type CellPosition = { rowIndex: number; columnIndex: number };
type CMAP = Map<string, [number, number]>;
export const useSheet = () => useContext(SpreadsheetContext);

type cellEditorProps = {
  cellEditor: LexicalEditor;
};

type pSheetChip = {
  rows: Rows;
  nodeKey: NodeKey;
  theme: EditorThemeClasses;
};

type UFn = (node: SpreadsheetNode) => void;

type Measure = { size: number; point: number };

enum SORT {
  ASCENDING,
  DESCENDING,
}

type SortOptions = {
  type: SORT;
  x: number;
};

type TableRef = MutableRefObject<HTMLElement>;

const newClipboardItem = (data: string) => {
  return new ClipboardItem({
    "text/html": new Blob([data as BlobPart], {
      type: "text/html",
    }),
  });
};

function getCurrentDocument(editor: LexicalEditor): Document {
  const rootElement = editor.getRootElement();
  return rootElement !== null ? rootElement.ownerDocument : document;
}

export default function Sheet({
  rows: rawRows,
  theme,
  nodeKey,
}: pSheetChip) {
  const { config } = useContext(SpreadsheetContext);

  const [editor] = useLexicalComposerContext();

  const [
    isSelected,
    setSelected,
    clearSelection,
  ] = useLexicalNodeSelection(nodeKey);

  const cellEditor = useMemo(() => {
    if (config === null) return null;
    const _cellEditor = createEditor({
      namespace: config.namespace,
      nodes: config.nodes,
      onError: (error) => config.onError(error, _cellEditor),
      theme: config.theme,
    });
    return _cellEditor;
  }, [config]);

  const [
    selectedIDs,
    setSelectedIDs,
  ] = useState<string[]>([]);

  const selectedSet = useMemo(() => {
    return new Set(selectedIDs);
  }, [selectedIDs]);

  const addRowsRef = useRef(null);

  const lastCellIDRef = useRef<NSTR>(null);

  const tableResizerRulerRef = useRef<HTML_DIV_REF>(null);

  const mouseDown = useRef(false);

  const [
    showAddColumns,
    setShowAddColumns,
  ] = useState(false);

  const [
    showAddRows,
    setShowAddRows,
  ] = useState(false);

  const tableRef = useRef<null | HTMLTableElement>(null);
  const resizeMeasureRef = useRef<Measure>({ point: 0, size: 0 });
  const setResizeMeasure = useCallback((point: number, size: number) => {
    resizeMeasureRef.current = { point, size };
  }, [editor, tableRef.current]);

  const [resizingID, setResizingID] = useState<NSTR>(null);

  const [
    sortOptions,
    setSortOptions,
  ] = useState<SortOptions | null>(null);

  const [isEditing, setIsEditing] = useState(false);

  const cellmap = useMemo(() => {
    const map: CMAP = new Map();
    const R = rawRows.length;
    for (let rowIndex = 0; rowIndex < R; rowIndex++) {
      const row = rawRows[rowIndex];
      const cells = row.cells;
      const C = cells.length;
      for (let columnIndex = 0; columnIndex < C; columnIndex++) {
        const cell = cells[columnIndex];
        map.set(cell.id, [rowIndex, columnIndex]);
      }
    }
    return map;
  }, [rawRows]);

  const rows = useMemo(() => {
    return rawRows;
  }, [rawRows, sortOptions]);

  const [
    primarySelectedID,
    setPrimarySelectedID,
  ] = useState<NSTR>(null);

  const getCellsFromRows = (rect: Rect) => {
    const { startX, endX, startY, endY } = rect;
    const newrows: Rows = [];
    for (let rowIndex = startY; rowIndex <= endY; rowIndex++) {
      const row = rows[rowIndex];
      const newrow = newRow();
      for (let colIndex = startX; colIndex <= endX; colIndex++) {
        const cell = row.cells[colIndex];
        const clonedCell = cloneCell(cell);
        clonedCell.id = uid();
        newrow.cells.push(clonedCell);
      }
      newrows.push(newrow);
    }
    return newrows;
  };

  useEffect(() => {
    const tableElem = tableRef.current;
    if (
      isSelected &&
      document.activeElement === document.body &&
      tableElem !== null
    ) {
      tableElem.focus();
    }
  }, [isSelected]);

  const updateNode = useCallback((fn: UFn) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isSpreadsheetNode(node)) {
        fn(node);
      }
    });
  }, [editor, nodeKey]);

  const addRow = () => {
    updateNode((node) => {
      $addUpdateTag(HISTORY_PUSH);
      node.addRows(1);
    });
  };

  const addColumn = () => {
    updateNode((node) => {
      $addUpdateTag(HISTORY_PUSH);
      node.addColumns(1);
    });
  };

  const modifyCells = useCallback(
    (x: number, y: number, extend: boolean) => {
      const id = rows[y].cells[x].id;
      lastCellIDRef.current = id;
      if (extend) {
        const selectedIDs = getSelectedIDs(
          rows,
          primarySelectedID as string,
          id,
          cellmap,
        );
        setSelectedIDs(selectedIDs);
      } else {
        setPrimarySelectedID(id);
        setSelectedIDs(NONE);
        focusCell(tableRef.current as HTMLElement, id);
      }
    },
    [cellmap, primarySelectedID, rows],
  );

  const saveEditorToJSON = useCallback(() => {
    if (cellEditor !== null && primarySelectedID !== null) {
      const json = JSON.stringify(cellEditor.getEditorState());
      console.log(json);
      updateNode((node) => {
        const coords = cellmap.get(primarySelectedID);
        if (coords === undefined) {
          return;
        }
        $addUpdateTag("history-push");
        const [x, y] = coords;
        node.updateCellValue(x, y, json);
      });
    }
  }, [cellmap, cellEditor, editor, primarySelectedID, updateNode]);

  const selectTable = useCallback(() => {
    setTimeout(() => {
      const root = editor.getRootElement();
      if (root === null) return;
      root.focus({ preventScroll: true });
      window.getSelection()?.removeAllRanges();
    }, 20);
  }, [editor]);

  const NONE: string[] = [];

  useEffect(() => {
    const tableElement = tableRef.current;
    if (tableElement === null) return;
    const doc = getCurrentDocument(editor);

    const atTableEdge = (event: PointerEvent) => {
      const x = event.clientX - tableRect.x;
      const y = event.clientY - tableRect.y;
      const res = x < 5 || y < 5;
      return res;
    };

    const handlePointerDown = (event: PointerEvent) => {
      const pid = getCellID(event.target as Html); // possible id
      if (
        pid !== null &&
        tableElement.contains(event.target as Html)
      ) {
        if (atTableEdge(event)) {
          setSelected(true);
          setPrimarySelectedID(null);
          selectTable();
          return;
        }
        setSelected(false);
        if (isResizing(event.target as Html)) {
          setResizingID(pid);
          tableElement.style.userSelect = "none";
          resizeMeasureRef.current = {
            point: event.clientX,
            size: getCellWidth(event.target as HTMLElement),
          };
          return;
        }
        mouseDown.current = true;
        if (primarySelectedID !== pid) {
          if (isEditing) {
            saveEditorToJSON();
          }
          setPrimarySelectedID(pid);
          setIsEditing(false);
          lastCellIDRef.current = pid;
        } else {
          lastCellIDRef.current = null;
        }
        setSelectedIDs(NONE);
      } // user is interact with a UI component
      else if (
        primarySelectedID !== null && !targetOnUI(event.target as Html)
      ) {
        setSelected(false);
        mouseDown.current = false;
        if (isEditing) {
          saveEditorToJSON();
        }
        setPrimarySelectedID(null);
        setSelectedIDs(NONE);
        setIsEditing(false);
        lastCellIDRef.current = null;
      }
    };

    const tableRect = tableElement.getBoundingClientRect();

    const handlePointerMove = (event: PointerEvent) => {
      // user grabbed resize handle
      if (resizingID !== null) {
        const resizerElement = tableResizerRulerRef.current;
        if (resizerElement !== null) {
          const { size, point } = resizeMeasureRef.current;
          const diff = event.clientX - point;
          const updatedWidth = size + diff;
          let x = event.clientX - tableRect.x;
          if (x < 10) {
            x = 10;
          } else if (x > tableRect.width - 10) {
            x = tableRect.width - 10;
          } else if (updatedWidth < 20) {
            x = point - size + 20 - tableRect.x;
          }
          resizerElement.style.left = `${x}px`;
        }
        return;
      }

      if (!isEditing) {
        // all add columns button to render if cursors is on the
        // table's right edge
        const { clientX, clientY } = event;
        const { width, x, y, height } = tableRect;
        setShowAddColumns(
          clientX > x + width * 0.9 &&
            clientX < x + width + 40 &&
            !mouseDown.current,
        );
        // allow add rows button to render if the cursor is on the
        // table's bottom edge
        setShowAddRows(
          event.target === addRowsRef.current ||
            (clientY > y + height * 0.85 &&
              clientY < y + height + 5 &&
              !mouseDown.current),
        );
      }
      // don't do anything if the user is working and for some
      // reason the cursor moves (e.g., user's arm bumps into mouse)
      if (isEditing || !mouseDown.current || primarySelectedID === null) {
        return;
      }
      const pid = getCellID(event.target as Html);
      if (pid !== null && pid !== lastCellIDRef.current) {
        if (selectedIDs.length === 0) {
          tableElement.style.userSelect = "none";
        }
        const _selectedIDs = getSelectedIDs(
          rows,
          primarySelectedID,
          pid,
          cellmap,
        );
        if (_selectedIDs.length === 1) {
          setSelectedIDs(NONE);
        } else {
          setSelectedIDs(_selectedIDs);
        }
        lastCellIDRef.current = pid;
      }
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (resizingID !== null) {
        const { size, point } = resizeMeasureRef.current;
        const diff = event.clientX - point;
        let updatedWidth = size + diff;
        if (updatedWidth < 10) {
          updatedWidth = 10;
        }
        updateNode((node) => {
          const coord = cellmap.get(resizingID)!;
          const [_, y] = coord;
          $addUpdateTag(HISTORY_PUSH);
          node.updateColumnWidth(y, updatedWidth);
        });
        setResizingID(null);
      }
      if (
        tableElement !== null &&
        selectedIDs.length > 1 &&
        mouseDown.current
      ) {
        tableElement.style.userSelect = "text";
        window.getSelection()?.removeAllRanges();
      }
      mouseDown.current = false;
    };

    doc.addEventListener("pointerdown", handlePointerDown);
    doc.addEventListener("pointermove", handlePointerMove);
    doc.addEventListener("pointerup", handlePointerUp);
    return () => {
      doc.removeEventListener("pointerdown", handlePointerDown);
      doc.removeEventListener("pointermove", handlePointerMove);
      doc.removeEventListener("pointerup", handlePointerUp);
    };
  }, [
    cellEditor,
    editor,
    isEditing,
    rows,
    saveEditorToJSON,
    primarySelectedID,
    selectedSet,
    selectedIDs,
    cellmap,
    resizingID,
    updateNode,
    setSelected,
    selectTable,
  ]);

  useEffect(() => {
    if (!isEditing && primarySelectedID !== null) {
      const doc = getCurrentDocument(editor);

      const loadContent = (cell: Cell | null) => {
        if (cell !== null && cellEditor !== null) {
          const editorStateJSON = cell.value;
          const editorState = cellEditor.parseEditorState(editorStateJSON);
          cellEditor.setEditorState(editorState);
        }
      };

      const handleDoubleClick = (event: MouseEvent) => {
        const pid = getCellID(event.target as Html);
        if (pid === primarySelectedID && editor.isEditable()) {
          const cell = getCell(rows, pid, cellmap);
          if (cell !== null && cellEditor !== null) {
            const editorStateJSON = cell.value;
            const editorState = cellEditor.parseEditorState(editorStateJSON);
            cellEditor.setEditorState(editorState);
          }
          setIsEditing(true);
          setSelectedIDs(NONE);
        }
      };

      const handleKeyDown = (event: KeyboardEvent) => {
        const keyCode = event.keyCode;
        if (
          keyCode === 16 ||
          keyCode === 27 ||
          keyCode === 9 ||
          keyCode === 37 ||
          keyCode === 38 ||
          keyCode === 39 ||
          keyCode === 40 ||
          keyCode === 8 ||
          keyCode === 46 ||
          !editor.isEditable()
        ) {
          return;
        }
        if (keyCode === 13) {
          event.preventDefault();
        }
        if (
          !isEditing &&
          primarySelectedID !== null &&
          editor.getEditorState().read(() => $getSelection() === null) &&
          (event.target as Html).contentEditable !== "true"
        ) {
          if (isCopy(keyCode, event.shiftKey, event.metaKey, event.ctrlKey)) {
            editor.dispatchCommand(COPY_COMMAND, event);
            return;
          }
          if (isCut(keyCode, event.shiftKey, event.metaKey, event.ctrlKey)) {
            editor.dispatchCommand(CUT_COMMAND, event);
            return;
          }
          if (isPaste(keyCode, event.shiftKey, event.metaKey, event.ctrlKey)) {
            editor.dispatchCommand(PASTE_COMMAND, event);
            return;
          }
        }
        if (event.metaKey || event.ctrlKey || event.altKey) {
          return;
        }
        const cell = getCell(rows, primarySelectedID, cellmap);
        loadContent(cell);
        setIsEditing(true);
        setSelectedIDs(NONE);
      };

      doc.addEventListener("dblclick", handleDoubleClick);
      doc.addEventListener("keydown", handleKeyDown);

      return () => {
        doc.removeEventListener("dblclick", handleDoubleClick);
        doc.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [
    cellEditor,
    editor,
    isEditing,
    rows,
    primarySelectedID,
    cellmap,
  ]);

  const updateCellsById = useCallback((ids: string[], fn: () => void) => {
    $updateCells(rows, ids, cellmap, cellEditor, updateNode, fn);
  }, [cellmap, cellEditor, rows, updateNode]);

  const clearCellsCommand = useCallback(() => {
    if (primarySelectedID !== null && !isEditing) {
      updateCellsById([primarySelectedID, ...selectedIDs], () => {
        const root = $getRoot();
        root.clear();
        root.append($createParagraphNode());
      });
      return true;
    }
    if (!isSelected) return false;
    updateNode((node) => {
      $addUpdateTag(HISTORY_PUSH);
      node.selectNext();
      node.remove();
    });
    return false;
  }, [
    isEditing,
    isSelected,
    primarySelectedID,
    selectedIDs,
    updateCellsById,
    updateNode,
  ]);

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(CLICK_COMMAND, (payload) => {
        const selection = $getSelection();
        if ($isNodeSelection(selection)) {
          return true;
        }
        return false;
      }, COMMAND_PRIORITY_LOW),
    );
  }, [
    cellmap,
    cellEditor,
    clearCellsCommand,
    clearSelection,
    editor,
    isEditing,
    modifyCells,
    nodeKey,
    primarySelectedID,
    rows,
    saveEditorToJSON,
    selectTable,
    selectedIDs,
    setSelected,
    updateNode,
  ]);

  if (cellEditor === null) {
    return null;
  }

  return (
    <div style={{ position: "relative" }}>
      <table
        ref={tableRef}
        className={`${theme.table} ${isSelected ? theme.tableSelected : ""}`}
        tabIndex={-1}
      >
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={row.id + rowIndex} className={theme.tableRow}>
              {row.cells.map((cell, columnIndex) => {
                const { id } = cell;
                return (
                  <CELL
                    cell={cell}
                    cellEditor={cellEditor}
                    key={id}
                    rowIndex={rowIndex}
                    columnIndex={columnIndex}
                    isPrimarySelected={primarySelectedID === id}
                    isSelected={selectedSet.has(id)}
                    theme={theme}
                    isEditing={isEditing}
                    updateNode={updateNode}
                    cellmap={cellmap}
                  />
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type pCELL = {
  cell: Cell;
  cellEditor: LexicalEditor;
  rowIndex: number;
  columnIndex: number;
  isPrimarySelected: boolean;
  isSelected: boolean;
  isEditing: boolean;
  theme: EditorThemeClasses;
  updateNode: (fn: UFn) => void;
  cellmap: CMAP;
};

function CELL({
  cell,
  cellEditor,
  rowIndex,
  columnIndex,
  isPrimarySelected,
  isSelected,
  isEditing,
  theme,
  updateNode,
  cellmap,
}: pCELL) {
  const Box = cell.type;
  const editorJSON = cell.value;
  const cellWidth = cell.width;

  return (
    <Box
      data-id={cell.id}
      tabIndex={-1}
      style={{ width: cellWidth !== null ? cellWidth : undefined }}
      className={`${theme.tableCell} ${
        cell.type === "th" ? theme.tableCellHeader : ""
      } ${isSelected ? theme.tableCellSelected : ""}`}
    >
      {isPrimarySelected && (
        <div
          className={`${theme.tableCellPrimarySelected} ${
            isEditing ? theme.tableCellEditing : ""
          }`}
        />
      )}
      {isPrimarySelected && isEditing
        ? <CellEditor cellEditor={cellEditor} />
        : (
          <>
            <div
              dangerouslySetInnerHTML={{
                __html: editorJSON === undefined || editorJSON === ""
                  ? emptyParagraph(theme)
                  : generateHTMLFromJSON(editorJSON, cellEditor),
              }}
            />
            <div
              className={theme.tableCellResizer}
              data-table-resize="true"
            />
          </>
        )}
      {!isEditing && (
        <ActionMenu
          updateNode={updateNode}
          cell={cell}
          rowIndex={rowIndex}
          columnIndex={columnIndex}
        />
      )}
    </Box>
  );
}

type menuProps = {
  rowIndex: number;
  columnIndex: number;
  cell: Cell;
  updateNode: (fn: UFn) => void;
};
function ActionMenu({ rowIndex, columnIndex, updateNode, cell }: menuProps) {
  return (
    <div className={styles.table_cell_action_button_container}>
      <Dropdown
        buttonClass={styles.table_cell_action_button}
        className={app.table_action_menu}
        title={<Chevron />}
        topOffset={5}
        leftOffset={25}
        selfClose={true}
        noPropogation
      >
        <Option
          label={`${cell.type === "td" ? "Set header" : "Unset header"}`}
          click={() =>
            updateNode((node) => {
              $addUpdateTag(HISTORY_PUSH);
              node.toggleCellType(rowIndex, columnIndex);
            })}
        />
      </Dropdown>
    </div>
  );
}

function CellEditor({ cellEditor }: cellEditorProps) {
  const { config, plugins } = useContext(SpreadsheetContext);

  if (config === null || plugins === null) {
    return null;
  }
  return (
    <LexicalNestedComposer
      initialEditor={cellEditor}
      initialTheme={config.theme}
      initialNodes={config.nodes}
      skipCollabChecks={true}
    >
      {plugins}
    </LexicalNestedComposer>
  );
}

function getSelectedRect(
  startID: string,
  endID: string,
  cellCoordMap: CMAP,
): null | { startX: number; endX: number; startY: number; endY: number } {
  const startCoords = cellCoordMap.get(startID);
  const endCoords = cellCoordMap.get(endID);
  if (startCoords === undefined || endCoords === undefined) {
    return null;
  }
  const startX = Math.min(startCoords[0], endCoords[0]);
  const endX = Math.max(startCoords[0], endCoords[0]);
  const startY = Math.min(startCoords[1], endCoords[1]);
  const endY = Math.max(startCoords[1], endCoords[1]);

  return {
    endX,
    endY,
    startX,
    startY,
  };
}

function getSelectedIDs(
  rows: Rows,
  startID: string,
  endID: string,
  cellCoordMap: CMAP,
): Array<string> {
  const rect = getSelectedRect(startID, endID, cellCoordMap);
  if (rect === null) {
    return [];
  }
  const { startX, endY, endX, startY } = rect;
  const ids = [];

  for (let x = startX; x <= endX; x++) {
    for (let y = startY; y <= endY; y++) {
      ids.push(rows[y].cells[x].id);
    }
  }
  return ids;
}

function getCell(
  rows: Rows,
  cellID: string,
  cellCoordMap: Map<string, [number, number]>,
): null | Cell {
  const coords = cellCoordMap.get(cellID);
  if (coords === undefined) {
    return null;
  }
  const [x, y] = coords;
  const row = rows[y];
  return row.cells[x];
}

function $updateCells(
  rows: Rows,
  ids: Array<string>,
  cellCoordMap: Map<string, [number, number]>,
  cellEditor: null | LexicalEditor,
  updateTableNode: (fn2: (tableNode: SpreadsheetNode) => void) => void,
  fn: () => void,
): void {
  for (const id of ids) {
    const cell = getCell(rows, id, cellCoordMap);
    if (cell !== null && cellEditor !== null) {
      const editorState = cellEditor.parseEditorState(cell.value);
      cellEditor._headless = true;
      cellEditor.setEditorState(editorState);
      cellEditor.update(fn, { discrete: true });
      cellEditor._headless = false;
      const newJSON = JSON.stringify(cellEditor.getEditorState());
      updateTableNode((node) => {
        const [x, y] = cellCoordMap.get(id) as [number, number];
        $addUpdateTag("history-push");
        node.updateCellValue(x, y, newJSON);
      });
    }
  }
}
