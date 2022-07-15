import { concatParsers, mapParser, parseConst, Parser, parseRegExp, parseWhitespace, reduceCombinator, tryParsers } from "./parser";


// language def
export type FormulaNode = |
    ConstantNode |    
    VariableNode |
    ConjunctionNode |
    DisjunctionNode |
    ImplicationNode |
    EquivalenceNode |
    RelationApplicationNode |
    UniversalQuantificationNode |
    ExistentialQuantificationNode;

export type ConstantNode = {
    type: "constant";
    value: "true" | "false";
}
export const ConstantNode = (v: boolean): ConstantNode => ({
    type: 'constant', value: `${v}`
});
export type VariableNode = {
    type: "variable";
    name: string;
}
export const VariableNode = (name: string): VariableNode => ({
    type: 'variable', name
});
export type ConjunctionNode = {
    type: "conjunction";
    children: FormulaNode[];
}
export const ConjunctionNode = (children: FormulaNode[]): ConjunctionNode => ({
    type: 'conjunction', children
});
export type DisjunctionNode = {
    type: "disjunction";
    children: FormulaNode[];
};
export const DisjunctionNode = (children: FormulaNode[]): DisjunctionNode => ({
    type: 'disjunction', children
});
export type ImplicationNode = {
    type: "implication";
    precedent: FormulaNode;
    antecedent: FormulaNode;
};
export const ImplicationNode = (precedent: FormulaNode, antecedent: FormulaNode): ImplicationNode => ({
    type: 'implication', precedent, antecedent
});
export type EquivalenceNode = {
    type: "equivalence";
    lhs: FormulaNode;
    rhs: FormulaNode;
}
export const EquivalenceNode = (lhs: FormulaNode, rhs: FormulaNode): EquivalenceNode => ({
    type: 'equivalence', lhs, rhs
});
export type RelationApplicationNode = {
    type: "relation_application";
    relationSymbol: string;
    args: (ConstantNode | VariableNode)[];
}
export const RelationApplicationNode = (relationSymbol: string, args: (ConstantNode | VariableNode)[]): RelationApplicationNode => ({
    type: 'relation_application', relationSymbol, args
});
export type UniversalQuantificationNode = {
    type: "universal_quantification";
    boundVariables: string[];
    expression: FormulaNode;
}
export const UniversalQuantificationNode = (boundVariables: string[], expression: FormulaNode): UniversalQuantificationNode => ({
    type: 'universal_quantification', boundVariables, expression
});
export type ExistentialQuantificationNode = {
    type: "existential_quantification";
    boundVariables: string[];
    expression: FormulaNode;
}
export const ExistentialQuantificationNode = (boundVariables: string[], expression: FormulaNode): ExistentialQuantificationNode => ({
    type: 'existential_quantification', boundVariables, expression
});




/// PARSER
const parseTruth = tryParsers(
    parseConst('T'), parseConst('1'), parseConst('true')
);
const parseFalsity = tryParsers(
    parseConst('F'), parseConst('0'), parseConst('false')
);
const parseAnd = parseConst('and');
const parseOr = parseConst('or');
const parseImplies = parseConst('=>');
const parseEquiv = parseConst('<=>');
const parseVariableSymbol = parseRegExp(/[a-z]+/);
const parseRelationSymbol = parseRegExp(/[A-Z]+/);


export const parseSubformula = reduceCombinator<FormulaNode>("subformula", function*() {
    try {
        return yield parseConstant;
    } catch (e) {}
    try {
        return yield parseVariable;
    } catch (e) {}
    return mapParser(concatParsers('subformula',
        parseConst('('), parseWhitespace, parseFormula, parseWhitespace, parseConst(')')
    ), ([,,f]) => f);
});

export const parseConstant: Parser<ConstantNode> = tryParsers(
    mapParser(parseTruth, () => ({ type: 'constant', value: 'true' })),
    mapParser(parseFalsity, () => ({ type: 'constant', value: 'false' }))
);

export const parseVariable: Parser<VariableNode> = mapParser(parseVariableSymbol, (name: string) => ({
    type: 'variable', name
}));

export const parseImplication: Parser<ImplicationNode> = mapParser(concatParsers('implication', 
    parseSubformula, parseWhitespace, parseImplies, parseWhitespace, parseSubformula
), ([p,,,,a]) => ({
    type: 'implication',
    precedent: p,
    antecedent: a
}));

export const parseEquivalence: Parser<EquivalenceNode> = mapParser(concatParsers('implication', 
    parseSubformula, parseWhitespace, parseEquiv, parseWhitespace, parseSubformula
), ([lhs,,,,rhs]) => ({
    type: 'equivalence',
    lhs, rhs
}));

const whitespaceJoin = <T>(p: Parser<T>, joinSymbol: Parser<string>, moreThanOneRequired = false) => 
    reduceCombinator<T[]>(`whitespace join of ${joinSymbol}`, function*() {
    
    const res: T[] = [];
    const first: T = yield p;
    res.push(first);
    try {
        while(true) {
            const next = yield mapParser(concatParsers('next item',
                parseWhitespace, joinSymbol, parseWhitespace, p
            ), ([,,,t]) => t);
            res.push(next);
        }
    } catch (e) {
        if (moreThanOneRequired && res.length === 1) {
            throw "more than one value required";
        }
        return res;
    }
});

const parseConjunction: Parser<ConjunctionNode> = mapParser(whitespaceJoin(parseSubformula, parseAnd, true), nodes => ({
    type: 'conjunction',
    children: nodes
}));
const parseDisjunction: Parser<DisjunctionNode> = mapParser(whitespaceJoin(parseSubformula, parseOr, true), nodes => ({
    type: 'disjunction',
    children: nodes
}));

const parseRelationApplication = reduceCombinator<RelationApplicationNode>('relation application', function*() {
    const relationSymbol: string = yield parseRelationSymbol;
    yield parseConst('(');
    yield parseWhitespace;
    const args: (ConstantNode | VariableNode)[] = yield whitespaceJoin(tryParsers(parseConstant, parseVariable), parseConst(','));
    yield parseWhitespace;
    yield parseConst(')');
    
    return {
        type: 'relation_application',
        relationSymbol, args
    };
});

const parseUniversalQuantification = reduceCombinator<UniversalQuantificationNode>('universal quantification', function*() {
    yield parseConst('forall');
    const spaceAfterForall: boolean = yield parseWhitespace;
    if (!spaceAfterForall) {
        throw "Expected space after 'forall' token";
    }
    const boundVariables: string[] = yield mapParser(whitespaceJoin(parseVariable, parseConst(',')), vars => vars.map(v => v.name));
    yield parseWhitespace;
    yield parseConst('.');
    const subformula: FormulaNode = yield parseSubformula;

    return {
        type: 'universal_quantification',
        boundVariables,
        expression: subformula
    };
});

const parseExistentialQuantification = reduceCombinator<ExistentialQuantificationNode>('existential quantification', function*() {
    yield parseConst('exist');
    const spaceAfterForall: boolean = yield parseWhitespace;
    if (!spaceAfterForall) {
        throw "Expected space after 'exist' token";
    }
    const boundVariables: string[] = yield mapParser(whitespaceJoin(parseVariable, parseConst(',')), vars => vars.map(v => v.name));
    yield parseWhitespace;
    yield parseConst('.');
    const subformula: FormulaNode = yield parseSubformula;

    return {
        type: 'existential_quantification',
        boundVariables,
        expression: subformula
    };
});

export const parseFormula: Parser<FormulaNode> = tryParsers(
    parseExistentialQuantification, parseUniversalQuantification,
    parseRelationApplication,
    parseConjunction, parseDisjunction,
    parseImplication, parseEquivalence,
    parseConstant, parseVariable,
);
