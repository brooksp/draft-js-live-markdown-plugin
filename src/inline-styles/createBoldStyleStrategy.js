import findRangesWithRegex from '../utils/findRangesWithRegex';

const boldRegex = /(\*\*\*|___)(.+?)(\*\*\*|___)|(\*\*|__)(.+?)(\*\*|__)/g;

const createBoldStyleStrategy = () => {
  return {
    style: 'BOLD',
    delimiters: ['**', '__', '***', '___'],
    find: text => {
      // Return an array of arrays containing start and end indices for ranges of
      // text that should be bolded
      // e.g. [[0,6], [10,20]]
      const boldRanges = findRangesWithRegex(text, boldRegex);
      return boldRanges;
    }
  };
};

export default createBoldStyleStrategy;
