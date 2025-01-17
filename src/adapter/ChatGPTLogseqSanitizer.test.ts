import {ChatGPTLogseqSanitizer} from "./ChatGPTLogseqSanitizer";

describe('basic tests', () => {
    test('basic markdown input string', () => {
        expect(ChatGPTLogseqSanitizer.sanitize("Hello **World**!")).toMatch("Hello **World**!");
    });
    test('basic markdown input string 2', () => {
        const input = 'This is some plain text.';
        const expectedOutput = 'This is some plain text.';
        expect(ChatGPTLogseqSanitizer.sanitize(input)).toMatch(expectedOutput);
    });
    test('empty input string', () => {
        expect(ChatGPTLogseqSanitizer.sanitize("")).toMatch("");
    });
});
describe('unicode support tests', () => {
    test('unicode input string', () => {
        expect(ChatGPTLogseqSanitizer.sanitize("Hello **世界**!")).toMatch("Hello **世界**!");
    });
});

describe('list sanitization tests', () => {
    test('basic list conversion', () => {
        const input = `- Main item 1\n- Main item 2`;
        const expected = `* Main item 1\n* Main item 2`;
        expect(ChatGPTLogseqSanitizer.sanitize(input)).toMatch(expected);
    });
    test('basic list conversion 2', () => {
        const input = `Hello **World!**!\n- Main item 1\n- Main item 2\n_This will not get converted:- :)_`;
        const expected = `Hello **World!**!\n* Main item 1\n* Main item 2\n_This will not get converted:- :)_`;
        expect(ChatGPTLogseqSanitizer.sanitize(input)).toMatch(expected);
    });
    test('"nested list conversion', () => {
        const input = `List 1:
        - Main item 1
            - Sub-item A
            - Sub-item B
        - Main item 2`;
        const expected = `List 1:
        * Main item 1
            * Sub-item A
            * Sub-item B
        * Main item 2`;
        expect(ChatGPTLogseqSanitizer.sanitize(input)).toMatch(expected);
    });
    test('"nested nested list conversion', () => {
        const input = `List 1:
        - Main item 1
            - Sub-item A
                - Sub-sub-item 1
                - Sub-sub-item 2
            - Sub-item B
        - Main item 2`;
        const expected = `List 1:
        * Main item 1
            * Sub-item A
                * Sub-sub-item 1
                * Sub-sub-item 2
            * Sub-item B
        * Main item 2`;
        expect(ChatGPTLogseqSanitizer.sanitize(input)).toMatch(expected);
    });
    test('avoid code blocks during list conversion', () => {
        const input = `Not a list:
        \`\`\`
            - Main item 1
              - Sub-item A
              - Sub-item B
        \`\`\`
        An actual list:
        - Main item 1`;
        const expected = `Not a list:
        \`\`\`
            - Main item 1
              - Sub-item A
              - Sub-item B
        \`\`\`
        An actual list:
        * Main item 1`;
        expect(ChatGPTLogseqSanitizer.sanitize(input)).toMatch(expected);
    });
    test('avoid inline code blocks during list conversion', () => {
        const input = `Not a list:
        \`- Main item 1\`
        An actual list:
        - Main item 1`;
        const expected = `Not a list:
        \`- Main item 1\`
        An actual list:
        * Main item 1`;
        expect(ChatGPTLogseqSanitizer.sanitize(input)).toMatch(expected);
    });
    test('avoid bold text during list conversion', () => {
        const input = `Not a list:
        **- Main item 1**`;
        expect(ChatGPTLogseqSanitizer.sanitize(input)).toMatch(input);
    });
    test('avoid table during list conversion', () => {
        const input = `| - First word 1 | Second word 1 |
                       |- First word 2 | Second word 2 |`;
        expect(ChatGPTLogseqSanitizer.sanitize(input)).toMatch(input);
    });
});

describe('heading sanitization tests', () => {
    test('basic heading conversion', () => {
        const input = `# Heading 1`;
        const expected = /^<h1>Heading 1<\/h1>$/;
        expect(ChatGPTLogseqSanitizer.sanitize(input)).toMatch(expected);
    });
    test('basic heading conversion with h6', () => {
        const input = `###### Heading 1\n**Hello World**`;
        const expected = /^<h6>Heading 1\s*<\/h6>\n\*\*Hello World\*\*$/;
        expect(ChatGPTLogseqSanitizer.sanitize(input)).toMatch(expected);
    });
    test('multiple heading conversion', () => {
        const input = `# Heading 1\n## Heading 2\n### Heading 3`;
        const expected = /^<h1>Heading 1<\/h1>\n<h2>Heading 2<\/h2>\n<h3>Heading 3<\/h3>$/;
        expect(ChatGPTLogseqSanitizer.sanitize(input)).toMatch(expected);
    });
    test('ignore list inside heading', () => {
        const input = `# - Main item 1`;
        const expected = /^<h1>- Main item 1<\/h1>$/;
        expect(ChatGPTLogseqSanitizer.sanitize(input)).toMatch(expected);
    });
    test('avoid inline code blocks during heading conversion', () => {
        const input = `\`# Heading\``;
        expect(ChatGPTLogseqSanitizer.sanitize(input)).toMatch(input);
    });
});
export {};
