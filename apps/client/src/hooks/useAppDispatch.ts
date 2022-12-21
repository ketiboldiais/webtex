import { useDispatch } from "react-redux";
import { StoreDispatch } from "src/model/store";

export const useAppDispatch = () => useDispatch<StoreDispatch>();
