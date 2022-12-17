import { useDispatch } from "react-redux";
import type { AppDispatch } from "../model/state/store";

export const useAppDispatch = () => useDispatch<AppDispatch>();
