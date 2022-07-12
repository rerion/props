import { Action, AnyAction, Reducer } from "@reduxjs/toolkit";

export type IntegrityCheck<S> = {
    check: (s: S) => boolean;
    description: string;
}

export const nullCheck: IntegrityCheck<any> = {
    check: () => true,
    description: 'NULL CHECK'
}

export type Scenario<S = any, A extends Action = AnyAction> = {
    description: string;
    initialState: S;
    actions: A[];
}

export function makeScenario<S, A extends Action>(initialState: S, actions: A[], description = ''): Scenario<S, A> {
    return {
        description, initialState, actions
    };
}

export type ReducerVerifierConfig<S, A extends Action> = {
    reducer: (init: S) => Reducer<S, A>;
    checks: IntegrityCheck<S>[];
}

export type StoreVerifierResult<S> = {
    status: 'passed' | 'failed';
    finalState: S;
    errorMessage?: string;
    failStep?: number;
}

export function reducerVerifier<S, A extends Action>(r: Reducer<S, A>) {
    return (check: IntegrityCheck<S>, scenario: Scenario<S, A>): StoreVerifierResult<S> => {
        const makeFailResult = (step: number, state: S): StoreVerifierResult<S> => ({
            status: 'failed',
            errorMessage: `Check '${check.description}' failed at step ${step} of scenario '${scenario.description}'`,
            failStep: step,
            finalState: state
        });
            
        const initialStateSuccess = check.check(scenario.initialState);
        if (!initialStateSuccess) {
            return makeFailResult(0, scenario.initialState);
        }

        let step = 1;
        let currentState = scenario.initialState;
        for (const action of scenario.actions) {
            currentState = r(currentState, action);
            const actionStateSuccess = check.check(currentState);
            if (!actionStateSuccess) {
                return makeFailResult(step, currentState);
            }
        }

        return { status: 'passed', finalState: currentState };
    }
}