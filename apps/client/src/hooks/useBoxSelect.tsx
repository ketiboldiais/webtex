import {
  createContext,
  CSSProperties,
  ReactNode,
  RefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

function htmlElement<K extends keyof HTMLElementTagNameMap>(
  of: K,
  styles: CSSProperties,
): HTMLElementTagNameMap[K] {
  const element = document.createElement(of);
  Object.assign(element.style, styles);
  return element;
}

export type PointXY = {
  x: number;
  y: number;
};

export const point = (x: number, y: number): PointXY => ({ x, y });

export type Area = {
  start: null | PointXY;
  end: null | PointXY;
};

const box = htmlElement("div", {
  position: "fixed",
  background: "transparent",
  boxShadow: "inset 0 0 0 2px hsl(206deg, 100% 50%/50%)",
  borderRadius: "2px",
  pointerEvents: "none",
  mixBlendMode: "multiply",
});

const drawBox = (boxElement: HTMLElement, start: PointXY, end: PointXY) => {
  if (end.x > start.x) {
    boxElement.style.left = start.x + "px";
    boxElement.style.width = (end.x - start.x) + "px";
  } else {
    boxElement.style.left = end.x + "px";
    boxElement.style.width = (start.x - end.x) + "px";
  }
  if (end.y > start.y) {
    boxElement.style.top = start.y + "px";
    boxElement.style.height = (end.y - start.y) + "px";
  } else {
    boxElement.style.top = end.y + "px";
    boxElement.style.height = (start.y - end.y) + "px";
  }
};

type pUseBoxSelect = {
  container: RefObject<HTMLElement>;
};

export function useBoxSelect({
  container = { current: document.body },
}: pUseBoxSelect) {
  const boxRef = useRef(box);
  const boxElement = boxRef;
  const [mouseDown, setMouseDown] = useState(false);
  const [selection, setSelection] = useState<null | DOMRect>(null);
  const [area, setArea] = useState<Area>({ start: null, end: null });

  const handleMouseMove = (e: MouseEvent) => {
    document.body.style.userSelect = "none";
    setArea((prev) => ({ ...prev, end: point(e.clientX, e.clientY) }));
  };

  const handleMouseDown = (e: MouseEvent) => {
    const containerElm = container.current;
    setMouseDown(true);
    if (containerElm && containerElm.contains(e.target as HTMLElement)) {
      document.addEventListener("mousemove", handleMouseMove);
      setArea({
        start: point(e.clientX, e.clientY),
        end: point(e.clientX, e.clientY),
      });
    }
  };

  const handleMouseUp = (e: MouseEvent) => {
    document.body.style.userSelect = "initial";
    document.removeEventListener("mousemove", handleMouseMove);
    setMouseDown(false);
  };

  useEffect(() => {
    const containerElm = container.current;
    if (containerElm) {
      containerElm.addEventListener("mousedown", handleMouseDown);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        containerElm.removeEventListener("mousedown", handleMouseDown);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [container]);

  useEffect(() => {
    if (area.start && area.end && boxElement.current) {
      drawBox(boxElement.current, area.start, area.end);
      setSelection(boxElement.current.getBoundingClientRect());
    }
  }, [area, boxElement]);

  useEffect(() => {
    const containerElement = container.current;
    const selectBoxElement = boxElement.current;
    if (containerElement && selectBoxElement) {
      if (mouseDown) {
        if (!document.body.contains(selectBoxElement)) {
          containerElement.appendChild(selectBoxElement);
        }
      } else {
        if (containerElement.contains(selectBoxElement)) {
          containerElement.removeChild(selectBoxElement);
        }
      }
    }
  }, [mouseDown, container, boxElement]);

  return selection;
}

export function useSelect(
  elementRef: RefObject<HTMLElement>,
  selection: DOMRect | null,
) {
  const [isSelected, setIsSelected] = useState(false);
  useEffect(() => {
    if (!elementRef.current || !selection) {
      setIsSelected(false);
    } else {
      const a = elementRef.current.getBoundingClientRect();
      const b = selection;
      setIsSelected(
        !(
          a.y + a.height < b.y ||
          a.y > b.y + b.height ||
          a.x + a.width < b.x ||
          a.x > b.x + b.width
        ),
      );
    }
  }, [elementRef, selection]);

  return isSelected;
}
type SelectionCtx = {
  selection: DOMRect | null;
  cref: RefObject<HTMLDivElement>;
};
export const SelectionContext = createContext<SelectionCtx>({
  selection: null,
  cref: { current: null },
});
export const useRect = () => useContext(SelectionContext);

type pProvider = {
  children: ReactNode;
};

export const SelectionContextProvider = ({ children }: pProvider) => {
  const cref = useRef<HTMLDivElement>(null);
  const selection = useBoxSelect({ container: cref });

  return (
    <SelectionContext.Provider value={{ selection, cref }}>
      {children}
    </SelectionContext.Provider>
  );
};
