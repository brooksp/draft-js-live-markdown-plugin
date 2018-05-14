import findRangesWithRegex from '../utils/findRangesWithRegex';

// Bold can be delimited by: **, __, ***, and ___
const createBoldStyleStrategy = () => {
  const asteriskDelimitedRegex =
    '(\\*\\*\\*)(.+?)(\\*\\*\\*)|(\\*\\*)(.+?)(\\*\\*)(?!\\*)';
  const underscoreDelimitedRegex = '(___)(.+?)(___)|(__)(.+?)(__)(?!_)';
  const boldRegex = new RegExp(
    `${asteriskDelimitedRegex}|${underscoreDelimitedRegex}`,
    'g'
  );
  const boldDelimiterRegex = /^(\*\*\*|\*\*|___|__)|(\*\*\*|\*\*|___|__)$/g;

  return {
    style: 'BOLD',
    delimiterStyle: 'BOLD-DELIMITER',
    findStyleRanges: text => {
      // Return an array of arrays containing start and end indices for ranges of
      // text that should be bolded
      // e.g. [[0,6], [10,20]]
      const boldRanges = findRangesWithRegex(text, boldRegex);
      return boldRanges;
    },
    findDelimiterRanges: (text, styleRanges) => {
      // Find ranges for delimiters at the beginning/end of styled text ranges
      // Returns an array of arrays containing start and end indices for delimiters
      let boldDelimiterRanges = [];
      styleRanges.forEach(styleRange => {
        const delimiterRange = findRangesWithRegex(
          text.substring(styleRange[0], styleRange[1] + 1),
          boldDelimiterRegex
        ).map(indices => indices.map(x => x + styleRange[0]));
        boldDelimiterRanges = boldDelimiterRanges.concat(delimiterRange);
      });
      return boldDelimiterRanges;
    },
    delimiterStyles: {
      opacity: 0.4
    }
  };
};

export default createBoldStyleStrategy;
