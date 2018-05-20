import findRangesWithRegex from '../utils/findRangesWithRegex';

const createInlineCodeStyleStrategy = () => {
  const codeRegex = /(`)(.+?)(`)/g;

  return {
    style: 'INLINE-CODE',
    findStyleRanges: text => {
      // Return an array of arrays containing start and end indices for ranges of
      // text that should be crossed out
      // e.g. [[0,6], [10,20]]
      const codeRanges = findRangesWithRegex(text, codeRegex);
      return codeRanges;
    },
    styles: {
      fontFamily: '"PT Mono", monospace',
      border: '1px solid #ddd',
      borderRadius: '3px',
      padding: '2px'
    }
  };
};

export default createInlineCodeStyleStrategy;
