import app from "../ui/styles/App.module.scss";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useState,
} from "react";
import { InputFn } from "../App";
import { concat, Iff, Render, toggle } from "../util";

const keyOf = <t extends {}>(obj: t) => {
  return Object.keys(obj).map((k) => (k as keyof t));
};

const createObj = <T extends Struct>(keys: (keyof T)[]) => {
  let obj: Struct = {};
  for (let i = 0; i < keys.length; i++) {
    obj[String(keys[i])] = "";
  }
  return obj as T;
};

interface tField<T extends Struct> {
  keyOfT: keyof T;
  value: string;
  onChange: InputFn;
}
function FieldEdit<T extends Struct>({ keyOfT, value, onChange }: tField<T>) {
  const [val, setVal] = useState(value);
  const handleEdit: InputFn = (event) => {
    const newValue = event.target.value;
    setVal(newValue);
    onChange(event);
  };
  return (
    <input
      type={"text"}
      onChange={handleEdit}
      className={app.grid_cell_input}
      value={val}
      name={String(keyOfT)}
    />
  );
}

interface iBtn {
  click: () => void;
}
function Close({ click }: iBtn) {
  return (
    <button className={app.grid_delete} onClick={click}>
      &times;
    </button>
  );
}

function Save({ click }: iBtn) {
  return <button className={app.grid_save} onClick={click}>Save</button>;
}
function Cancel({ click }: iBtn) {
  return <button className={app.grid_cancel} onClick={click}>Cancel</button>;
}

type Struct = { [key: string]: string };

interface TbProps<T extends Struct> {
  data: T[];
  onUpdate: Dispatch<SetStateAction<T[]>>;
  uid: string;
  keys: (keyof T)[];
  cell?: (v: string, k: keyof T) => ReactNode;
  schema?: {
    [k in keyof T]: {
      label: string | ReactNode;
      placeholder?: string;
      sort?: boolean;
    };
  };
  extraControls?: ReactNode[];
  headerClassName?: string;
  headingClassName?: string;
  cellClassName?: string;
}
type Order = "ascending" | "descending";

export function Table<T extends Struct>(
  {
    data,
    onUpdate,
    uid,
    schema,
    keys,
    cell,
    headerClassName = "",
    cellClassName = "",
    headingClassName = "",
  }: TbProps<T>,
) {
  const blank = createObj(keys);
  const headings = schema ? Object.values(schema).map((v) => v.label) : keys;
  const [entries, setEntries] = useState(data);
  const [editIndex, setEditIndex] = useState(-1);
  const [notEditing, setNotEditing] = useState(true);
  const [newEntry, setNewEntry] = useState(blank);
  const [editRow, setEditFormData] = useState(blank);
  const [sortKey, setSortKey] = useState<keyof T>("");
  const [sortOrder, setSortOrder] = useState<Order>("ascending");
  const [sortReverse, setSortReverse] = useState(false);

  const updateSort = (key: keyof T) => {
    if (key === sortKey) {
      setSortReverse(!sortReverse);
    }
    setSortKey(key);
    setSortOrder(sortOrder === "ascending" ? "descending" : "ascending");
  };

  const sortedData = useCallback(() => {
    if (!sortKey || !notEditing) return entries;
    const sorted = entries.sort((a, b) => {
      return a[sortKey] > b[sortKey] ? 1 : -1;
    });
    if (sortReverse) sorted.reverse();
    return sorted;
  }, [entries, sortKey, sortOrder, sortReverse]);

  const setEntryField: InputFn = (event) => {
    event.preventDefault();
    const keyOfT = event.target.getAttribute("name")!;
    const value = event.target.value;
    const entry: any = { ...newEntry };
    entry[keyOfT] = value;
    setNewEntry(entry);
  };

  const updateEntry: InputFn = (event) => {
    const keyOfT = event.target.getAttribute("name")!;
    const value = event.target.value;
    const entry: any = { ...editRow };
    entry[keyOfT] = value;
    setEditFormData(entry);
  };

  const focus = (index: number) => {
    setNotEditing(false);
    setEditIndex(index);
    setEditFormData({ ...entries[index] });
  };

  const updateRow = (updatedEntryIndex: number) => {
    for (let i = 0; i < keys.length; i++) {
      if (editRow[keys[i]] === "") {
        setEditIndex(-1);
        setNotEditing(true);
        return;
      }
    }
    const updatedEntry = { ...editRow };
    const updatedEntries = entries.map((entry, entryIndex) =>
      (entryIndex === updatedEntryIndex) ? updatedEntry : entry
    );
    setEntries(updatedEntries);
    onUpdate(updatedEntries);
    setEditIndex(-1);
    setNotEditing(true);
  };

  const abortEdit = () => {
    setEditIndex(-1);
    setNotEditing(true);
  };

  const addEntry = () => {
    for (let i = 0; i < keys.length; i++) {
      if (newEntry[keys[i]] === "") return;
    }
    const newEntries = [...entries, newEntry];
    setEntries(newEntries);
    onUpdate(newEntries);
    setNewEntry(blank);
  };

  const deleteEntry = (index: number) => {
    const newEntries = data.filter((_, idx) => idx !== index);
    setEntries(newEntries);
    onUpdate(newEntries);
  };

  return (
    <div className={app.grid_table}>
      <article
        className={concat(headerClassName, app.grid_header, app.grid_row)}
      >
        {headings.map((header, h) => (
          <div
            className={concat(
              headingClassName,
              app.grid_heading,
              app.grid_cell,
            )}
            key={concat("header", uid, h)}
            onClick={() =>
              schema && schema[keys[h]].sort && updateSort(keys[h])}
          >
            <div>
              {typeof header === "symbol" ? String(header) : header}
              <span>
                {Render(
                  <button
                    className={toggle(
                      app.grid_descend_icon,
                      app.grid_ascend_icon,
                    ).on(
                      keys[h] === sortKey && sortOrder === "descending",
                    )}
                  >
                    &#x25B2;
                  </button>,
                ).OnlyIf(schema && schema[keys[h]].sort)}
              </span>
            </div>
          </div>
        ))}
        <div className={concat(app.grid_cell, app.grid_heading, app.grid_hide)}>
          {"Control"}
        </div>
      </article>
      <article className={app.grid_body}>
        {sortedData().map((item: T, i) => (
          <div
            key={concat("row", i)}
            className={toggle(app.grid_edit_row, app.grid_row).on(
              i === editIndex,
            )}
          >
            {keyOf(item).map((p, j) => (
              <div
                key={concat(i, "cell", uid, j)}
                className={concat(cellClassName, app.grid_cell)}
              >
                {Iff(i === editIndex).Then(
                  <FieldEdit
                    keyOfT={p}
                    value={editRow[p]}
                    onChange={updateEntry}
                  />,
                ).Else(
                  <div
                    onClick={() => focus(i)}
                  >
                    {cell ? cell(item[p], p) : item[p]}
                  </div>,
                )}
              </div>
            ))}
            <div className={app.grid_cell}>
              {Render(
                <Close click={() => deleteEntry(i)} />,
              ).OnlyIf(notEditing || i !== editIndex)}
              {Render(
                <>
                  <Save click={() => updateRow(i)} />
                  <Cancel click={abortEdit} />
                </>,
              ).OnlyIf(!notEditing && i === editIndex)}
            </div>
          </div>
        ))}
      </article>
      <article className={concat(app.grid_footer, app.grid_row)}>
        {keys.map((h, i) => (
          <div key={concat("foot", uid, i)} className={app.grid_cell}>
            <input
              value={newEntry[keys[i]]}
              type={"text"}
              onChange={setEntryField}
              name={String(keys[i])}
              placeholder={schema ? schema[keys[i]].placeholder : ""}
              className={app.grid_cell_input}
            />
          </div>
        ))}
        <div className={concat(app.grid_cell, app.grid_push)}>
          <button
            className={app.grid_add}
            disabled={!notEditing}
            onClick={addEntry}
            key={concat("add", uid)}
          >
            {"add"}
          </button>
        </div>
      </article>
    </div>
  );
}
