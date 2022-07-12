import { createEntityAdapter, createSlice, EntityState, PayloadAction } from "@reduxjs/toolkit";


export type Sort = {
    id: string;
    size: number;
    relations: string[];
}

export type Relation = {
    id: string;
    domain: string[];
    charMap: {
        [key: string]: true;
    }
}

export const sortsAdapter = createEntityAdapter<Sort>();
export const relationsAdapter = createEntityAdapter<Relation>();

export type Model = {
    sorts: EntityState<Sort>;
    relations: EntityState<Relation>;
}

const initialState = {
    sorts: sortsAdapter.getInitialState(),
    relations: relationsAdapter.getInitialState()
};

export const modelSlice = createSlice({
    name: 'model',
    initialState,
    reducers: {
        sortAdded: {
            reducer(state, action: PayloadAction<Sort>) {
                sortsAdapter.addOne(state.sorts, action.payload);
                return state;
            },
            prepare(id: string, size: number) {
                return { payload: {
                    id, size, relations: []
                } };
            }
        },
        sortRemoved: {
            reducer(state, { payload: id }: PayloadAction<string>) {
                const relatedRelations = state.sorts.entities[id]!.relations;
                const removeRelationFromSorts = (relId: string) => {
                    const rel = state.relations.entities[relId]!;
                    const uniqueDomains = [...new Set(rel.domain)];
                    for (const domain of uniqueDomains) {
                        const sort = state.sorts.entities[domain]!;
                        sort.relations = sort.relations.filter(r => r !== relId);
                    }
                }
                relatedRelations.forEach(r => removeRelationFromSorts(r));
                relationsAdapter.removeMany(state.relations, relatedRelations);
                sortsAdapter.removeOne(state.sorts, id);
                return state;
            },
            prepare(id: string) {
                return { payload: id };
            }
        },
        relationAdded: {
            reducer(state, action: PayloadAction<Relation>) {
                const relation = action.payload;
                relationsAdapter.addOne(state.relations, relation);
                const uniqueDomains = [...new Set(relation.domain)];
                for (const domainSort of uniqueDomains) {
                    const sortRelations = state.sorts.entities[domainSort]!.relations;
                    sortRelations.push(relation.id);
                }
                return state;
            },
            prepare(id: string, domain: string[]) {
                return { payload: {
                    id, domain, charMap: {}
                } };
            }
        },
        relationCharMapChanged: {
            reducer(state, action: PayloadAction<{ id: string, changes: number[][] | number[] }>) {
                const { id, changes } = action.payload;
                const relation = state.relations.entities[id]!;

                const applyChange = (coords: number[]) => {
                    const key = coords.join('-');
                    if (relation.charMap[key]) {
                        delete relation.charMap[key];
                    } else {
                        relation.charMap[key] = true;
                    }
                };

                if (changes.length === 0 && relation.domain.length !== 0) {
                    return state;
                }
                if (changes.length === 0 && relation.domain.length === 0) {
                    applyChange([]);
                    return state;
                }
                if (Array.isArray(changes[0])) {
                    (changes as number[][]).forEach((coords: number[]) => {
                        applyChange(coords);
                    });
                    return state;
                }
                if (!Array.isArray(changes[0])) {
                    applyChange(changes as number[]);
                    return state;
                }
            },
            prepare(id: string, changes: number[][] | number[]) {
                return {
                    payload: { id, changes }
                };
            }
        },
        relationRemoved: {
            reducer(state, action: PayloadAction<string>) {
                relationsAdapter.removeOne(state.relations, action.payload);
            },
            prepare(id: string) {
                return { payload: id };
            }
        }
    }
});

export const { sortAdded, sortRemoved, relationAdded, relationRemoved, relationCharMapChanged } = modelSlice.actions;

export default modelSlice.reducer;