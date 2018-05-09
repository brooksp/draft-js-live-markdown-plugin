import findRangesWithRegex from '../utils/findRangesWithRegex';

const strikethroughRegex = /(~~)(.+?)(~~)/g;

const createStrikethroughStyleStrategy = () => {
  return {
    style: 'STRIKETHROUGH',
    delimiters: ['~~'],
    find: text => {
      // Return an array of arrays containing start and end indices for ranges of
      // text that should be crossed out
      // e.g. [[0,6], [10,20]]
      const strikethroughRanges = findRangesWithRegex(text, strikethroughRegex);
      return strikethroughRanges;
    }
  };
};

export default createStrikethroughStyleStrategy;
