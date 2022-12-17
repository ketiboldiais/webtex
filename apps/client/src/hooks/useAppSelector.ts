import { TypedUseSelectorHook, useSelector } from "react-redux";
import type { RootState } from "../model/state/store";

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
