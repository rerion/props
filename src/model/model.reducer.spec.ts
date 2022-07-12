import { EntityState } from "@reduxjs/toolkit";
import { IntegrityCheck, makeScenario, nullCheck, reducerVerifier } from "testing/store-integrity";
import { modelSlice, Relation, relationAdded, relationCharMapChanged, Sort, sortAdded, sortRemoved } from "./model.reducer";

type State = {
    sorts: EntityState<Sort>;
    relations: EntityState<Relation>;
}

const reducer = modelSlice.reducer;
const verify = reducerVerifier(reducer);
const initialState = modelSlice.getInitialState();

// checks
const sortsHaveValidRelations: IntegrityCheck<State> = {
    description: 'sorts should only have existing relations', 
    check: s => {
        const sortIds = s.sorts.ids;
        const relationEntities = s.relations.entities;
        for (const sortId of sortIds) {
            const sort = s.sorts.entities[sortId]!;
            for (const rel of sort.relations) {
                if (!relationEntities[rel]) {
                    return false;
                }
            }
        }
        return true;
    }
};
const relationsHaveValidDomains: IntegrityCheck<State> = {
    description: 'relation domains should be sorts',
    check: s => {
        const sortEntities = s.sorts.entities;
        const relations = s.relations.ids;
        for (const relId of relations) {
            const relation = s.relations.entities[relId]!;
            for (const sort of relation.domain) {
                if (!sortEntities[sort]) {
                    return false;
                }
            }
        }
        return true;
    }
};
const relationCharMapsRightSize: IntegrityCheck<State> = {
    description: 'relation char map key dimension should equal domain size',
    check: s => {
        const relations = s.relations.ids;
        for (const relId of relations) {
            const relation = s.relations.entities[relId]!;
            const coords: string[][] = Object.keys(relation.charMap)
                .map(c => c.split('-'));
            const validCoords = coords.every(coord => coord.length === relation.domain.length);
            if (!validCoords) {
                return false;
            }
        }
        return true;
    }
}
const relationCharCoordsWithinDomainBounds: IntegrityCheck<State> = {
    description: 'relation char map keys have entries within domain',
    check: s => {
        const relations = s.relations.ids;
        for (const relId of relations) {
            const relation = s.relations.entities[relId]!;
            const coords: string[][] = Object.keys(relation.charMap)
                .map(c => c.split('-'));
            const validCoords = coords.every(coord => coord.every((pos, i) => {
                const relevantSortSize = s.sorts.entities[relation.domain[i]]!.size;
                return +pos >= 0 && +pos < relevantSortSize;
            }));
            if (!validCoords) {
                return false;
            }
        }
        return true;
    }
}


test('adding invalid relation throws', () => {
    const scenario = makeScenario(initialState, [
        sortAdded('X', 1),
        relationAdded('R', ['X', 'Y'])
    ]);

    expect(() => verify(nullCheck, scenario)).toThrow();
});

test('sorts have existing relations as domains', () => {
    const scenario1 = makeScenario(initialState, [
        sortAdded('X', 5),
        sortAdded('Y', 6),
        relationAdded('R', ['X', 'Y', 'Y'])
    ]);

    const scenario2 = makeScenario(initialState, [
        sortAdded('X', 5),
        relationAdded('R1', ['X']),
        relationAdded('R2', ['X', 'X']),
        relationAdded('R3', [])
    ]);
    
    const scenario3 = makeScenario(initialState, [
        sortAdded('X', 5),
        sortAdded('Y', 6),
        relationAdded('R', ['X', 'Y', 'Y']),
        sortRemoved('X')
    ]);

    expect(verify(sortsHaveValidRelations, scenario1).status).toBe('passed');
    expect(verify(sortsHaveValidRelations, scenario2).status).toBe('passed');
    expect(verify(sortsHaveValidRelations, scenario3).status).toBe('passed');
});

test('relations should have existing sorts in domain', () => {
    const scenario1 = makeScenario(initialState, [
        sortAdded('X', 5),
        sortAdded('Y', 6),
        relationAdded('R', ['X', 'Y', 'Y'])
    ]);
    
    const scenario2 = makeScenario(initialState, [
        sortAdded('X', 5),
        sortAdded('Y', 6),
        relationAdded('R', ['X', 'Y', 'Y']),
        sortRemoved('X')
    ]);


    expect(verify(relationsHaveValidDomains, scenario1).status).toBe('passed');
    expect(verify(relationsHaveValidDomains, scenario2).status).toBe('passed');
});

test('relation char maps keys have dimension of domain', () => {
    const scenario = makeScenario(initialState, [
        sortAdded('X', 5),
        sortAdded('Y', 2),
        relationAdded('R', ['X', 'Y', 'Y']),
        relationCharMapChanged('R', [
            [3, 1, 1],
            [2, 1, 0],
            [4, 1, 1]
        ]),
    ]);
    const scenario2 = makeScenario(initialState, [
        sortAdded('X', 5),
        sortAdded('Y', 2),
        relationAdded('R', ['X', 'Y', 'Y']),
        relationCharMapChanged('R', [
            [3, 1],
        ]),
    ]);

    expect(verify(relationCharMapsRightSize, scenario).status).toBe('passed');
    expect(verify(relationCharMapsRightSize, scenario2).status).toBe('failed');
});

test('relation char map keys should be within bound of domain', () => {
    const scenario = makeScenario(initialState, [
        sortAdded('X', 5),
        sortAdded('Y', 2),
        relationAdded('R', ['X', 'Y', 'Y']),
        relationCharMapChanged('R', [
            [3, 1, 1],
            [2, 1, 0],
            [4, 1, 1]
        ]),
    ]);
    const scenario2 = makeScenario(initialState, [
        sortAdded('X', 5),
        sortAdded('Y', 2),
        relationAdded('R', ['X', 'Y', 'Y']),
        relationCharMapChanged('R', [
            [2, 2, 0],
        ]),
    ]);
    const scenario3 = makeScenario(initialState, [
        sortAdded('X', 5),
        sortAdded('Y', 2),
        relationAdded('R', ['X', 'Y', 'Y']),
        relationCharMapChanged('R', [
            [-1, 0, 0],
        ]),
    ]);
    expect(verify(relationCharCoordsWithinDomainBounds, scenario).status).toBe('passed');
    expect(verify(relationCharCoordsWithinDomainBounds, scenario2).status).toBe('failed');
    expect(() => verify(relationCharCoordsWithinDomainBounds, scenario3)).toThrow();
});