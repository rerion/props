import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Sort = {
    id: string;
    size: number;
}
export type Sorts = {
    [id: string]: Sort;
};

const initialState: Sorts = {};


export const sortsSlice = createSlice({
    name: 'sorts',
    initialState,
    reducers: {
        domainSet(state, action: PayloadAction<Sort>) {
            state[action.payload.id] = { ...action.payload };
        },
        domainRemoved(state, action: PayloadAction<{ id: string }>) {
            delete state[action.payload.id];
        }
    }
});


export const { domainRemoved, domainSet } = sortsSlice.actions;

export default sortsSlice.reducer;