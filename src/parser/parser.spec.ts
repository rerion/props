import { concatParsers, mapParser, parseConst, parseError, parseRegExp, parseSuccess, parseWhitespace, ParsingError, ParsingResult, reduceCombinator, testParser, tryParsers } from "./parser";

describe('parseConst', () => {
    test('parseConst reads constant string at given offset', () => {
        const parseAsd = parseConst('asd');
        const parseRfl = parseConst('rfl');

        const source = "asd xwz rfl ntr";

        const parsingResult1 = parseAsd({ source, offset: 0 });
        const parsingResult2 = parseAsd({ source, offset: 3 });
        const parsingResult3 = parseRfl({ source, offset: 8 });

        expect(parsingResult1.status).toBe('success');
        expect(parsingResult2.status).toBe('error');
        expect(parsingResult3.status).toBe('success');
    });

    test('successful parsing of constant has the constant as result', () => {
        const parseAsd = parseConst('asd');
        const source = "asd xwz asdntr";
        
        const parsingResult1 = parseAsd({ source, offset: 0 }) as ParsingResult<string>;
        const parsingResult2 = parseAsd({ source, offset: 8 }) as ParsingResult<string>;

        expect(parsingResult1.result).toBe('asd');
        expect(parsingResult2.result).toBe('asd');
    });

    test('parsing constant advances position by string length', () => {
        const str = 'asdasd';
        const parseAsd = parseConst(str);
        const source = "asdasdfsjld";
        const source2 = "rs ajk asdasdfsjld";

        const parsingResult = parseAsd({ source, offset: 0 }) as ParsingResult<string>;
        const parsingResult2 = parseAsd({ source: source2, offset: 7 }) as ParsingResult<string>;

        expect(parsingResult.nextPosition).toBe(0 + str.length);
        expect(parsingResult2.nextPosition).toBe(7 + str.length);
    });
});

describe('parseRegExp', () => {
    const parseEmail = parseRegExp(/([a-zA-Z0-9\.]+@)([a-zA-Z0-9]+)\.[a-z-A-Z]+/);
    test('parseRegExp reads string matching regexp at offset', () => {
        expect(parseEmail({
            source: 'asd213.sda@ds.com Mohammed Ababou', offset: 0
        }).status).toBe('success');
        expect(parseEmail({
            source: 'Mohammed Ababou asd213.sda@ds.com', offset: 16
        }).status).toBe('success');
        expect(parseEmail({
            source: 'asd213.sdads.com Mohammed Ababou', offset: 0
        }).status).toBe('error');
    });
    test('result is matched string', () => {
        const result = parseEmail({
            source: 'asd213.sda@ds.com Mohammed Ababou', offset: 0
        }) as ParsingResult<string>;
        expect(result.result).toBe('asd213.sda@ds.com');
    });
    test('position is advanced by length of result', () => {
        const result = parseEmail({
            source: 'Mohammed Ababou asd213.sda@ds.com', offset: 16
        }) as ParsingResult<string>;
        expect(result.nextPosition).toBe(16 + result.result.length);
    });
});

describe('parseWhitespace', () => {
    test('parses whitespace', () => {
        expect(parseWhitespace({ source: 'hi \t ds', offset: 2 }).status).toBe('success');
    });
    test('always succeeds', () => {
        expect(parseWhitespace({ source: 'thereisnowhitespacehere', offset: 0 }).status).toBe('success');
    });
    test('result is true if whitespace was consumed', () => {
        const result = parseWhitespace({ source: 'hi \t ds', offset: 2 }) as ParsingResult<boolean>;
        const result2 = parseWhitespace({ source: 'hi \t ds', offset: 0 }) as ParsingResult<boolean>;
        expect(result.result).toBe(true);
        expect(result2.result).toBe(false);
    });
    test('position is advanced by whitespace', () => {
        const result = parseWhitespace({ source: 'hi \t ds', offset: 2 }) as ParsingResult<boolean>;
        expect(result.nextPosition).toBe(2 + ' \t '.length);
    });
});

describe('parseSuccess', () => {
    test('always succeeds with passed value', () => {
        const value = {};
        const result = parseSuccess(value)({ source: 'asdasd', offset: 3 });
        expect(result.status).toBe('success');
        expect((result as ParsingResult<{}>).result).toBe(value);
    });
    test('doesn\'t advance position', () => {
        const result = parseSuccess({})({ source: 'asdasd', offset: 3 });
        expect((result as ParsingResult<{}>).nextPosition).toBe(3);
    });
});

describe('parseError', () => {
    test('always fails with given reason', () => {
        const result = parseError('some reason')({ source: 'asdasd', offset: 3 });
        expect(result.status).toBe('error');
        expect((result as ParsingError).reason).toBe('some reason');
    });
});

describe('concatParsers', () => {
    const parseImportantWords = concatParsers('important words',
        parseConst('some'), parseWhitespace, 
        parseConst('important'), parseWhitespace,
        parseConst('words')
    );
    test('runs parsers in sequence', () => {
        const input = { source: 'some important words', offset: 0 };
        const result = parseImportantWords(input) as ParsingResult<[string, boolean, string, boolean, string]>;
        expect(result.status).toBe('success');
        expect(result.result).toEqual(['some', true, 'important', true, 'words']);
    });
    test('fails if either of sequenced parsers fails', () => {
        const input = { source: 'some nonimportant words', offset: 0 };
        const result = parseImportantWords(input);
        expect(result.status).toBe('error');
    });
    test('fails with message of failed parser followed by own name message', () => {
        const input = { source: 'some nonimportant words', offset: 0 };
        const result = parseImportantWords(input) as ParsingError;
        expect(result.reason).toBe('Could not read string "important" at position 5,\nwhen trying to parse "important words" at position 0');
    });
});

describe('tryParsers', () => {
    const parseNumber = tryParsers(
        parseConst('one'),
        parseConst('two'),
        parseConst('three'),
        parseConst('four')
    );
    test('tries parsers in order and returns result of first successful one', () => {
        const input = { source: 'three', offset: 0 };
        const result = parseNumber(input) as ParsingResult<string>;
        expect(result.status).toBe('success');
        expect(result.result).toBe('three');
    });
    test('fails if no parsers match', () => {
        const input = { source: 'five', offset: 0 };
        const result = parseNumber(input) as ParsingError;
        expect(result.status).toBe('error');
    });
    test('prints all tried parsers in failure message', () => {
        const input = { source: 'five', offset: 0 };
        const result = parseNumber(input) as ParsingError;
        const errorMsg = 
`All of the following parsers have failed:
  * Could not read string "one" at position 0
  * Could not read string "two" at position 0
  * Could not read string "three" at position 0
  * Could not read string "four" at position 0`
        expect(result.reason).toBe(errorMsg);
    });
});

describe('mapParser', () => {
    test('maps result of successful parsing', () => {
        const parse = mapParser(parseConst('asdx'), s => s.length);
        const res = parse({ source: 'asdx asf', offset: 0 }) as ParsingResult<number>;
        expect(res.result).toBe(4);
    });
});

describe('testParser', () => {
    test('return parser that always succeeds', () => {
        const parse = testParser(parseError('I FAIL'));
        expect(parse({ source: '', offset: 0 }).status).toBe('success');
    });
    test('result has original result wrapped if original parser succeeds', () => {
        const originalParse = parseConst('hello');
        const parse = testParser(originalParse);
        const input = { source: 'hello', offset: 0 };
        const res = parse(input) as ParsingResult<{ success: true, value: string }>;
        const originalRes = originalParse(input) as ParsingResult<string>;
        expect(res).toEqual({
            status: originalRes.status,
            nextPosition: originalRes.nextPosition,
            result: {
                success: true,
                value: originalRes.result
            }
        });
    });
    test('returns { success: false } on original parser error', () => {
        const originalParse = parseConst('hello');
        const parse = testParser(originalParse);
        const input = { source: 'no hello', offset: 0 };
        const res = parse(input) as ParsingResult<{ success: false }>;
        const originalRes = originalParse(input) as ParsingError;
        expect(res).toEqual({
            status: 'success',
            nextPosition: originalRes.position,
            result: {
                success: false,
            }
        });
    });
});

describe('reduceCombinator', () => {
    test('accepts generator constructor yielding parsers and returns a parser', () => {
        const parse = reduceCombinator<"hello">('parse hello', function*() {
            return 'hello';
        });

        const res = parse({ source: '', offset: 0 }) as ParsingResult<'hello'>;
        expect(res.result).toBe('hello');
    });
    test('returns parsing result at yield point', () => {
        const value = {};
        const parse = reduceCombinator<{}>('parse hello', function*() {
            return yield parseSuccess(value);
        });
        const res = parse({ source: '', offset: 0 }) as ParsingResult<{}>;
        expect(res.result).toBe(value);
    });
    test('throws parsing error at yield point', () => {
        const parse = reduceCombinator<string>('parse error', function*() {
            try {
                yield parseError('I FAIL');
            } catch(e) {
                return (e as string);
            }
            return 'I SUCCEED';
        });
        const res = parse({ source: '', offset: 0 }) as ParsingResult<string>;
        expect(res.result).toBe('I FAIL');
    });
    test('executes yield statements in order', () => {
        const parse = reduceCombinator<null>('parse example', function*() {
            yield parseWhitespace;
            yield parseConst('example');
            yield parseWhitespace;
            return null;
        });
        const source = '   example   ';
        const res = parse({ source, offset: 0 }) as ParsingResult<null>;
        expect(res).toEqual({
            status: 'success',
            result: null,
            nextPosition: source.length
        });
    });
    test('resulting parser fails on throw inside generator', () => {
        const parse = reduceCombinator<null>('throwing generator', function*() {
            yield parseConst('hiya');
            throw 'ERROR';
        });
        const res = parse({ source: 'hiya', offset: 0 }) as ParsingResult<null>;
        expect(res).toEqual({
            status: 'error',
            position: 0,
            reason: 'ERROR at position 4,\nwhen trying to parse "throwing generator" at position 0'
        });
    });
});