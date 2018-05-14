import findRangesWithRegex from '../utils/findRangesWithRegex';

const createItalicStyleStrategy = () => {
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

  const italicDelimiterRegex = /^(\*\*\*|\*|___|_)|(\*\*\*|\*|___|_)$/g;

  return {
    style: 'ITALIC',
    delimiterStyle: 'ITALIC-DELIMITER',
    findStyleRanges: text => {
      // Return an array of arrays containing start and end indices for ranges of
      // text that should be italicized
      // e.g. [[0,6], [10,20]]
      const italicRanges = findRangesWithRegex(text, italicRegex);
      return italicRanges;
    },
    findDelimiterRanges: (text, styleRanges) => {
      // Find ranges for delimiters at the beginning/end of styled text ranges
      // Returns an array of arrays containing start and end indices for delimiters
      let italicDelimiterRanges = [];
      styleRanges.forEach(styleRange => {
        const delimiterRange = findRangesWithRegex(
          text.substring(styleRange[0], styleRange[1] + 1),
          italicDelimiterRegex
        ).map(indices => indices.map(x => x + styleRange[0]));
        italicDelimiterRanges = italicDelimiterRanges.concat(delimiterRange);
      });
      return italicDelimiterRanges;
    },
    delimiterStyles: {
      opacity: 0.4
    }
  };
};

export default createItalicStyleStrategy;
