import { TypedUseSelectorHook, useDispatch as useNativeDispatch, useSelector as useNativeSelector } from "react-redux";
import { RootState, AppDispatch } from "./store";

export const useDispatch: () => AppDispatch = useNativeDispatch;
export const useSelector: TypedUseSelectorHook<RootState> = useNativeSelector;