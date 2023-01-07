const print = console.log;
import {
  useState,
  useEffect,
  useRef,
  ChangeEvent,
  ReactNode,
  createContext,
  useContext,
} from 'react';
import Styles from '@styles/Sheet.module.css';
import { number } from 'joi';

type tdata = string | number;

type tSheetCtx = {
  cols: number;
  rows: number;
  setCols: React.Dispatch<React.SetStateAction<number>>;
  setRows: React.Dispatch<React.SetStateAction<number>>;
  data: string[][];
  setData: React.Dispatch<React.SetStateAction<string[][]>>;
};

const SheetCtx = createContext<null | tSheetCtx>(null);

type html = HTMLElement;
type ΔInput = ChangeEvent<HTMLInputElement>;
type JSXs = { children: ReactNode | string };

type CellProps = { c: number; r: number; v: string };
const Cell = ({ c, r, v }: CellProps) => {
  const ctx = useContext(SheetCtx);
  const [val, setVal] = useState(v);

  const [editing, setEditing] = useState(false);

  const ref = useRef(null);

  const updateVal = (E: ΔInput) => {
    setVal(E.target.value);
  };

  const input = (
    <input data-cell-id={`${c}${r}`} ref={ref} onChange={updateVal} />
  );

  const disp = <div>{val}</div>;

  const outClick = (event: MouseEvent) => {
    if ((event.target as html)?.dataset?.cellId !== `${c}${r}`) {
      setEditing(true);
    }
  };

  useEffect(() => {
    document.addEventListener('click', outClick);
    return document.addEventListener('click', outClick);
  }, []);

  return <div className={Styles.cell}>{editing ? input : disp}</div>;
};

const Sheet = () => {
  const [cols, setCols] = useState(3);
  const [rows, setRows] = useState(3);
  const [data, setData] = useState(
    [...Array(cols)].map(() => [...Array(rows).fill('')])
  );
  print(data);
  return (
    <SheetCtx.Provider value={{ cols, rows, data, setRows, setCols, setData }}>
      <div className={Styles.Sheet}>
      </div>
    </SheetCtx.Provider>
  );
};

export { Sheet };
