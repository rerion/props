import { ConjunctionNode, ConstantNode, DisjunctionNode, EquivalenceNode, 
    ImplicationNode, parseFormula, RelationApplicationNode, UniversalQuantificationNode, VariableNode } from "./language";
import { ParsingResult } from "./parser";

const just = (s: string) => ({ source: s, offset: 0 });

test('parses logical constants', () => {
    const parsingConstantsResults: ConstantNode[] =
        ['F', '0', 'false', 'T', '1', 'true']
            .map(s => parseFormula(just(s)) as ParsingResult<ConstantNode>)
            .map(r => r.result);
    expect(parsingConstantsResults.every(c => c.type === 'constant')).toBeTruthy();
    expect(parsingConstantsResults.map(c => c.value)).toEqual(['false', 'false', 'false', 'true', 'true', 'true']);
});

test('parses lowercase words as variables', () => {
    const parsingResult = parseFormula(just('xx')) as ParsingResult<VariableNode>;
    expect(parsingResult.status).toBe('success');
    expect(parsingResult.result).toEqual<VariableNode>({
        type: 'variable',
        name: 'xx'
    });
});

test('parses simple implications', () => {
    const cases = [
        'a => b',
        'a=>    b',
        'a => false',
    ];
    const results = cases
        .map(s => parseFormula(just(s)) as ParsingResult<ImplicationNode>)
        .map(r => r.result);
    expect(results).toEqual<ImplicationNode[]>([
        { type: 'implication', precedent: { type: 'variable', name: 'a' }, antecedent: { type: 'variable', name: 'b' } },
        { type: 'implication', precedent: { type: 'variable', name: 'a' }, antecedent: { type: 'variable', name: 'b' } },
        { type: 'implication', precedent: { type: 'variable', name: 'a' }, antecedent: { type: 'constant', value: 'false' } },
    ]);
});

test('parses simple equivalences', () => {
    const cases = [
        'a <=> b',
        'b<=>    b',
        'false <=> true',
    ];
    const results = cases
        .map(s => parseFormula(just(s)) as ParsingResult<EquivalenceNode>)
        .map(r => r.result);

    expect(results).toEqual<EquivalenceNode[]>([
        { type: 'equivalence', lhs: { type: 'variable', name: 'a' }, rhs: { type: 'variable', name: 'b' } },
        { type: 'equivalence', lhs: { type: 'variable', name: 'b' }, rhs: { type: 'variable', name: 'b' } },
        { type: 'equivalence', lhs: { type: 'constant', value: 'false' }, rhs: { type: 'constant', value: 'true' } },
    ]);
});

test('parses simple conjunctions', () => {
    const cases = [
        'a and b',
        'b and    b and  c',
        'false and b',
    ];


    const results = cases
        .map(s => parseFormula(just(s)) as ParsingResult<ConjunctionNode>)
        .map(r => r.result);

    expect(results).toEqual<ConjunctionNode[]>([
        { type: 'conjunction', children: [{ type: 'variable', name: 'a' }, { type: 'variable', name: 'b' }] },
        { type: 'conjunction', children: [{ type: 'variable', name: 'b' }, { type: 'variable', name: 'b' }, { type: 'variable', name: 'c' }] },
        { type: 'conjunction', children: [{ type: 'constant', value: 'false' }, { type: 'variable', name: 'b' }] },
    ]);
});

test('parses simple disjunction', () => {
    const testStr = "a or false or true       or b";
    const result = parseFormula(just(testStr)) as ParsingResult<DisjunctionNode>;
    expect(result.result).toEqual<DisjunctionNode>({
        type: 'disjunction', children: [
            { type: 'variable', name: 'a' },
            { type: 'constant', value: 'false' },
            { type: 'constant', value: 'true' },
            { type: 'variable', name: 'b' },
        ]
    });
});

test('parses relation application', () => {
    const testStr = "R(  x,y,  z ,false ,w)";
    const result = parseFormula(just(testStr)) as ParsingResult<RelationApplicationNode>;
    expect(result.result).toEqual<RelationApplicationNode>({
        type: 'relation_application',
        relationSymbol: 'R',
        args: [
            { type: 'variable', name: 'x' },
            { type: 'variable', name: 'y' },
            { type: 'variable', name: 'z' },
            { type: 'constant', value: 'false' },
            { type: 'variable', name: 'w' },
        ]
    })
});

test('parses universal quantification', () => {
    // TODO: this fails FIXME
    const testStr = "forall x, y,   z. R(x, w, z)";
    const result = parseFormula(just(testStr)) as ParsingResult<UniversalQuantificationNode>;
    console.log(result.result);
    expect(result.result).toEqual<UniversalQuantificationNode>({
        type: 'universal_quantification',
        boundVariables: ['x', 'y', 'z'],
        expression: {
            type: 'relation_application',
            relationSymbol: 'R',
            args: [
                { type: 'variable', name: 'x' },
                { type: 'variable', name: 'w' },
                { type: 'variable', name: 'z' },
            ]
        }
    });
});