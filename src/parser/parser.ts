// types
export type ParsingError = {
    status: 'error';
    reason: string;
    position: number;
}

export type ParsingResult<T> = {
    status: 'success';
    result: T;
    nextPosition: number;
}

export type ParserInput = {
    source: string;
    offset: number;
}

export type Parser<T> = (input: ParserInput) => ParsingError | ParsingResult<T>;

// base parsers
export const parseConst: (s: string) => Parser<string> = (s: string) => (input: ParserInput) => {
    const read = input.source.slice(input.offset, input.offset + s.length);
    if (read === s) {
        return {
            status: 'success',
            result: s,
            nextPosition: input.offset + s.length
        };
    } else {
        return {
            status: 'error',
            reason: `Could not read string "${s}" at position ${input.offset}`,
            position: input.offset
        };
    }
}

export const parseRegExp: (r: RegExp) => Parser<string> = (r: RegExp) => (input: ParserInput) => {
    const offsetSource = input.source.slice(input.offset);
    const execResult = r.exec(offsetSource);
    if (execResult === null) {
        return {
            status: 'error',
            reason: `Could not read regular expression ${r} at position ${input.offset}`,
            position: input.offset
        };
    } else {
        return {
            status: 'success',
            result: execResult[0],
            nextPosition: input.offset + execResult[0].length
        };
    }
}

export const parseWhitespace: Parser<boolean> = mapParser(parseRegExp(/\s*/), s => s.length > 0);

export const parseSuccess: <R>(res: R) => Parser<R> = <R>(r: R) => (input: ParserInput) => {
    return {
        status: 'success',
        nextPosition: input.offset,
        result: r
    };
}

export const parseError: (reason: string) => Parser<any> = (reason: string) => (input: ParserInput) => {
    return {
        status: 'error',
        reason, position: input.offset
    };
}


// parser combinators
function concatParsers<T1>(name: string, p1: Parser<T1>): Parser<[T1]>;
function concatParsers<T1, T2>(name: string, p1: Parser<T1>, p2: Parser<T2>): Parser<[T1, T2]>;
function concatParsers<T1, T2, T3>(name: string, p1: Parser<T1>, p2: Parser<T2>, p3: Parser<T3>): Parser<[T1, T2, T3]>;
function concatParsers<T1, T2, T3, T4>(name: string, p1: Parser<T1>, p2: Parser<T2>, p3: Parser<T3>, p4: Parser<T4>): Parser<[T1, T2, T3, T4]>;
function concatParsers<T1, T2, T3, T4, T5>(name: string, p1: Parser<T1>, p2: Parser<T2>, p3: Parser<T3>, p4: Parser<T4>, p5: Parser<T5>): Parser<[T1, T2, T3, T4, T5]>;
function concatParsers(name: string, ...ps: Parser<any>[]): Parser<any[]>;
function concatParsers(name: string, ...parsers: Parser<any>[]): Parser<any[]> {
    return (input: ParserInput) => {
        const results: any[] = [];
        let currentOffset = input.offset;
        for (const parser of parsers) {
            const result = parser({ source: input.source, offset: currentOffset });
            if (result.status === 'error') {
                return {
                    ...result, 
                    position: input.offset,
                    reason: result.reason + `,\nwhen trying to parse "${name}" at position ${input.offset}`
                };
            }
            results.push(result.result);
            currentOffset = result.nextPosition;
        }

        return {
            status: 'success',
            result: results,
            nextPosition: currentOffset
        };
    };
}
export { concatParsers };


function tryParsers<T1>(p1: Parser<T1>): Parser<T1>;
function tryParsers<T1, T2>(p1: Parser<T1>, p2: Parser<T2>): Parser<T1 | T2>;
function tryParsers<T1, T2, T3>(p1: Parser<T1>, p2: Parser<T2>, p3: Parser<T3>): Parser<T1 | T2 | T3>;
function tryParsers<T1, T2, T3, T4>(p1: Parser<T1>, p2: Parser<T2>, p3: Parser<T3>, p4: Parser<T4>): Parser<T1 | T2 | T3 | T4>;
function tryParsers<T1, T2, T3, T4, T5>(p1: Parser<T1>, p2: Parser<T2>, p3: Parser<T3>, p4: Parser<T4>, p5: Parser<T5>): Parser<T1 | T2 | T3 | T4 | T5>;
function tryParsers(...ps: Parser<any>[]): Parser<any>;
function tryParsers(...parsers: Parser<any>[]): Parser<any> {
    return (input: ParserInput) => {
        const errors: string[] = [];
        for (const parser of parsers) {
            const result = parser(input);
            if (result.status === 'success') {
                return result;
            }
            errors.push(result.reason);
        }
        return {
            status: 'error',
            position: input.offset,
            reason: `All of the following parsers have failed:` + errors.map(err => '\n  * ' + err).join('')
        };
    };
}
export { tryParsers };

export function mapParser<T, R>(p: Parser<T>, fn: (t: T) => R): Parser<R> {
    return (input: ParserInput) => {
        const res = p(input);
        if (res.status === 'success') {
            return {
                ...res, result: fn(res.result)
            };
        } else {
            return res;
        }
    };
}

export function testParser<T>(p: Parser<T>): Parser<{ success: true, value: T } | { success: false }> {
    return (input: ParserInput) => {
        const res = p(input);
        if (res.status === 'success') {
            return {
                ...res,
                result: {
                    success: true,
                    value: res.result
                }
            };
        } else {
            return {
                status: 'success',
                result: {
                    success: false
                },
                nextPosition: input.offset
            };
        }
    };
}


export function reduceCombinator<R>(name: string, combinator: () => Generator<Parser<any>, R, any>): Parser<R> {
    return (input: ParserInput) => {
        const generator = combinator();
        let currentOffset = input.offset;
        try {
            let next = generator.next();
            while(true) {
                if (next.done) {
                    return {
                        status: 'success',
                        nextPosition: currentOffset,
                        result: next.value
                    };
                }
                const currentParser = next.value;
                const currentParsingResult = currentParser({ source: input.source, offset: currentOffset });
                if (currentParsingResult.status === 'success') {
                    currentOffset = currentParsingResult.nextPosition;
                    next = generator.next(currentParsingResult.result);
                } else {
                    next = generator.throw(currentParsingResult.reason);
                }
            }
        } catch (err: any) {
            return {
                status: 'error',
                reason: err + ` at position ${currentOffset},\nwhen trying to parse "${name}" at position ${input.offset}`,
                position: input.offset
            }
        }
    };
}