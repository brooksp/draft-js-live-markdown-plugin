// Ordered List item delimiter
import findRangesWithRegex from '../utils/findRangesWithRegex';

const createOLDelimiterStyleStrategy = () => {
  const olDelimiterRegex = /^\d{1,3}\. /g;

  return {
    style: 'OL-DELIMITER',
    findStyleRanges: text => {
      const olDelimiterRanges = findRangesWithRegex(text, olDelimiterRegex);
      return olDelimiterRanges;
    },
    styles: {
      position: 'absolute',
      transform: 'translateX(calc(-100% - 12px))'
    }
  };
};

export default createOLDelimiterStyleStrategy;
