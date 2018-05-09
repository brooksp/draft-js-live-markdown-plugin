import findRangesWithRegex from '../utils/findRangesWithRegex';

const asteriskDelimitedRegex = '(?<!\\*)(\\*)(?!\\*)(.+?)(?<!\\*)\\*(?!\\*)'; // *italic*
const underscoreDelimitedRegex = '(?<!_)(_)(?!_)(.+?)(?<!_)_(?!_)'; // _italic_
const strongEmphasisRegex = '(\\*\\*\\*|___)(.+?)(\\*\\*\\*|___)'; // ***bolditalic*** ___bolditalic___
const boldWrappedAsteriskRegex =
  '(?<=\\*\\*)(\\*)(?!\\*)(.*?[^\\*]+)(?<!\\*)\\*(?![^\\*]\\*)|(?<!\\*)(\\*)(?!\\*)(.*?[^\\*]+)(?<!\\*)\\*(?=\\*\\*)'; // ***italic* and bold** **bold and *italic***
const boldWrappedUnderscoreRegex =
  '(?<=__)(_)(?!_)(.*?[^_]+)(?<!_)_(?![^_]_)|(?<!_)(_)(?!_)(.*?[^_]+)(?<!_)_(?=__)'; // ___italic_ and bold__ __bold and _italic___
const italicRegex = new RegExp(
  `${asteriskDelimitedRegex}|${underscoreDelimitedRegex}|${strongEmphasisRegex}|${boldWrappedAsteriskRegex}|${boldWrappedUnderscoreRegex}`,
  'g'
);

const createItalicStyleStrategy = () => {
  return {
    style: 'ITALIC',
    delimiters: ['*', '_', '***', '___'],
    find: text => {
      // Return an array of arrays containing start and end indices for ranges of
      // text that should be italicized
      // e.g. [[0,6], [10,20]]
      const italicRanges = findRangesWithRegex(text, italicRegex);
      return italicRanges;
    }
  };
};

export default createItalicStyleStrategy;
