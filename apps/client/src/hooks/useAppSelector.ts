import { TypedUseSelectorHook, useSelector } from "react-redux";
import { RootState } from "src/model/store";

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
