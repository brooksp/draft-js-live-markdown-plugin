import findRangesWithRegex from '../utils/findRangesWithRegex';

const createStrikethroughStyleStrategy = () => {
  const strikethroughRegex = /(~~)(.+?)(~~)/g;
  const strikethroughDelimiterRegex = /^(~~)|(~~)$/g;

  return {
    style: 'STRIKETHROUGH',
    delimiterStyle: 'STRIKETHROUGH-DELIMITER',
    findStyleRanges: text => {
      // Return an array of arrays containing start and end indices for ranges of
      // text that should be crossed out
      // e.g. [[0,6], [10,20]]
      const strikethroughRanges = findRangesWithRegex(text, strikethroughRegex);
      return strikethroughRanges;
    },
    findDelimiterRanges: (text, styleRanges) => {
      // Find ranges for delimiters at the beginning/end of styled text ranges
      // Returns an array of arrays containing start and end indices for delimiters
      let strikethroughDelimiterRanges = [];
      styleRanges.forEach(styleRange => {
        const delimiterRange = findRangesWithRegex(
          text.substring(styleRange[0], styleRange[1] + 1),
          strikethroughDelimiterRegex
        ).map(indices => indices.map(x => x + styleRange[0]));
        strikethroughDelimiterRanges = strikethroughDelimiterRanges.concat(
          delimiterRange
        );
      });
      return strikethroughDelimiterRanges;
    },
    styles: {
      textDecoration: 'line-through'
    },
    delimiterStyles: {
      opacity: 0.4,
      textDecoration: 'none'
    }
  };
};

export default createStrikethroughStyleStrategy;
