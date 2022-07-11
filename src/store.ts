import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch as useNativeDispatch, useSelector as useNativeSelector } from "react-redux";

import modelReducer, { relationsAdapter, sortsAdapter } from "./model/model.reducer";

export const mainStore = configureStore({
    reducer: {
        model: modelReducer,
    }
});



export type RootState = ReturnType<typeof mainStore.getState>;
export type AppDispatch = typeof mainStore.dispatch;

export const useDispatch: () => AppDispatch = useNativeDispatch;
export const useSelector: TypedUseSelectorHook<RootState> = useNativeSelector;

export const sortsSelectors = sortsAdapter.getSelectors((state: RootState) => state.model.sorts);
export const relationsSelectors = relationsAdapter.getSelectors((state: RootState) => state.model.relations);

export default mainStore;