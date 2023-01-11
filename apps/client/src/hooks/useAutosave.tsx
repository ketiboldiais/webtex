import { useEffect, useState, useRef } from 'react';

function useDebounce<T>(data: T, interval: number) {
  const [liveData, setLiveData] = useState<T>(data);
  useEffect(() => {
    if (typeof window !== undefined) {
      const handler = setTimeout(() => {
        setLiveData(data);
      }, interval);
      return () => clearTimeout(handler);
    }
  }, [data, interval]);
  return liveData;
}
interface autoSaveProps<A, B> {
  data: A;
  onSave: (data: A) => Promise<B> | B | void;
  interval?: number;
  saveOnUnmount?: boolean;
}
export function useAutosave<A, B>({
  data,
  onSave,
  interval = 30_000,
  saveOnUnmount = true,
}: autoSaveProps<A, B>) {
  const valueOnCleanup = useRef(data);
  const initialRender = useRef(true);
  const handleSave = useRef(onSave);
  const debounceValue = useDebounce(data, interval);
  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
    } else {
      handleSave.current(debounceValue);
    }
  }, [debounceValue]);
  useEffect(() => {
    valueOnCleanup.current = data;
  }, [data]);
  useEffect(() => {
    handleSave.current = onSave;
  }, [onSave]);
  useEffect(
    () => () => {
      if (saveOnUnmount) {
        handleSave.current(valueOnCleanup.current);
      }
    },
    [saveOnUnmount]
  );
}
