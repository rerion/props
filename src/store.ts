import { configureStore } from "@reduxjs/toolkit";

import relationsReducer from "./model/relations/relations.reducer";
import sortsReducer from "./model/sorts/sorts.reducer";

export const mainStore = configureStore({
    reducer: {
        sorts: sortsReducer,
        relations: relationsReducer
    }
});


export type RootState = ReturnType<typeof mainStore.getState>;
export type AppDispatch = typeof mainStore.dispatch;


export default mainStore;