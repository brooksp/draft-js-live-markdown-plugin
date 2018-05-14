// Unordered List item delimiter
import findRangesWithRegex from '../utils/findRangesWithRegex';

const createULDelimiterStyleStrategy = () => {
  const ulDelimiterRegex = /^\* /g;

  return {
    style: 'UL-DELIMITER',
    findStyleRanges: text => {
      const ulDelimiterRanges = findRangesWithRegex(text, ulDelimiterRegex);
      return ulDelimiterRanges;
    }
  };
};

export default createULDelimiterStyleStrategy;
