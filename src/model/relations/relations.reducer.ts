import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// TODO: implement integrity checks
// > domains must be sorts
// > length domain == length args of charFn
export type Relation = {
    id: string;
    domain: string[];
    charFn: (...coords: number[]) => boolean; // TODO: thats very inefficient but will work for not too heavily modified relation
}

export type Relations = {
    [key: string]: Relation;
}

const initialState: Relations = {};

export const relationsSlice = createSlice({
    name: 'relations',
    initialState,
    reducers: {
        relationAdded(state, action: PayloadAction<{ id: string; domain: string[]; }>) {
            state[action.payload.id] = { ...action.payload, charFn: (...coords) => false };
        },
        relationRemoved(state, action: PayloadAction<{ id: string }>) {
            delete state[action.payload.id];
        },
        relationCharFnChanged(state, action: PayloadAction<{ id: string; coords: number[]; newValue: boolean; }>) {

        }
    }
});

export const { relationAdded, relationRemoved } = relationsSlice.actions;

export default relationsSlice.reducer;