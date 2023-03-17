import S from "@styles/App.module.css";
import {
  Dispatch,
  Fragment,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { BtnEvt, BtnFn, InputFn } from "./App";

const objKeys = <t extends {}>(obj: t) => {
  return Object.keys(obj).map((k) => (k as keyof t));
};

type BaseType = string | symbol | number | boolean;

function isBaseType(value: any): value is BaseType {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "symbol"
  );
}

type Struct = { [key: string]: string };

interface TbProps<T extends Struct> {
  data: T[];
  onUpdate: Dispatch<SetStateAction<T[]>>;
  keys: (keyof T)[];
  headers?: string[];
}

const createObj = <T extends Struct>(keys: (keyof T)[]) => {
  let obj: Struct = {};
  for (let i = 0; i < keys.length; i++) {
    obj[String(keys[i])] = "";
  }
  return obj as T;
};

export function Tb<T extends Struct>(
  { data, keys, headers, onUpdate }: TbProps<T>,
) {
  const blank = createObj(keys);
  const headings = headers ? headers.slice(0, keys.length) : keys;
  const [entries, setEntries] = useState(data);
  const [editIndex, setEditIndex] = useState(-1);
  const [notEditing, setNotEditing] = useState(true);
  const [addFormData, setAddFormData] = useState(blank);
  const [editFormData, setEditFormData] = useState(blank);

  const handleAddForm: InputFn = (event) => {
    event.preventDefault();
    const fieldName = event.target.getAttribute("name")!;
    const fieldValue = event.target.value;
    const newFormData: any = { ...addFormData };
    newFormData[fieldName] = fieldValue;
    setAddFormData(newFormData);
  };

  const handleEdit: InputFn = (event) => {
    event.preventDefault();
    const fieldName = event.target.getAttribute("name")!;
    const fieldValue = event.target.value;
    const newFormData: any = { ...editFormData };
    newFormData[fieldName] = fieldValue;
    setEditFormData(newFormData);
  };

  const onEditClick = (event: BtnEvt, index: number) => {
    event.preventDefault();
    setNotEditing(false);
    setEditIndex(index);
    setEditFormData({ ...entries[index] });
  };

  const onSave = (event: BtnEvt, index: number) => {
    event.preventDefault();
    const update = { ...editFormData };
    const updatedEntries = entries.map((t, i) => {
      return (i === index) ? update : t;
    });
    setEntries(updatedEntries);
    onUpdate(updatedEntries);
    setEditIndex(-1);
    setNotEditing(true);
  };
  
  const abortEdit = () => {
    setEditIndex(-1);
    setNotEditing(true);
  }

  const handleAddFormSubmit: BtnFn = (event) => {
    event.preventDefault();
    const newEntries = [...entries, addFormData];
    setEntries(newEntries);
    onUpdate(newEntries);
    setAddFormData(blank);
  };

  const del = (index: number) => {
    const newEntries = data.filter((_, idx) => idx !== index);
    setEntries(newEntries);
    onUpdate(newEntries);
  };

  const s = {
    display: "grid",
    gridTemplateColumns: `repeat(${keys.length + 1},1fr)`,
  };

  return (
    <div className={S.Table}>
      <div>
        <section style={s}>
          {headings.map((header, i) => (
            <div key={`${String(header)}${i}`}>{String(header)}</div>
          ))}
        </section>
        <section>
          {entries.map((item: T, i) => (
            <Fragment key={`row${i}`}>
              <div style={s}>
                {objKeys(item).map((p, j) => (
                  <Fragment key={`${i}cell${j}`}>
                    {i === editIndex
                      ? (
                        <input
                          type={"text"}
                          style={{ background: "lightgrey" }}
                          onChange={handleEdit}
                          value={editFormData[p]}
                          name={String(p)}
                        />
                      )
                      : (
                        <div>
                          {isBaseType(item[p]) ? item[p] as ReactNode : ""}
                        </div>
                      )}
                  </Fragment>
                ))}
                <div>
                  {(notEditing || i !== editIndex) && (
                    <>
                      <button onClick={() => del(i)}>
                        &times;
                      </button>
                      <button onClick={(event) => onEditClick(event, i)}>
                        Edit
                      </button>
                    </>
                  )}
                  {!notEditing && i === editIndex && (
                    <>
                      <button onClick={(e) => onSave(e, i)}>Save</button>
                      <button onClick={(e) => onSave(e, i)}>Cancel</button>
                    </>
                  )}
                </div>
              </div>
            </Fragment>
          ))}
        </section>
      </div>
      <form style={s}>
        {keys.map((h, i) => (
          <input
            value={addFormData[keys[i]]}
            key={`${String(h)}${i}`}
            type={"text"}
            onChange={handleAddForm}
            className={S.EntryInput}
            name={String(keys[i])}
            required
          />
        ))}
        <button
          onClick={handleAddFormSubmit}
          className={S.AddEntryBtn}
        >
          Add
        </button>
      </form>
    </div>
  );
}

export function Table() {
  const [data, setData] = useState([
    { city: "NYC", pop: "512" },
    { city: "LA", pop: "932" },
    { city: "SF", pop: "95432" },
    { city: "London", pop: "1294" },
    { city: "Tokyo", pop: "9201" },
  ]);

  return (
    <Tb
      data={data}
      onUpdate={setData}
      keys={["city", "pop"]}
      headers={["City", "Population"]}
    />
  );
}
