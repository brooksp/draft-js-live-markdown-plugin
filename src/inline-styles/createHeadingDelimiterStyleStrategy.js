import findRangesWithRegex from '../utils/findRangesWithRegex';

const createHeadingDelimiterStyleStrategy = () => {
  const headingDelimiterRegex = /(^#{1,6})\s/g;

  return {
    style: 'HEADING-DELIMITER',
    findStyleRanges: text => {
      const headingDelimiterRanges = findRangesWithRegex(
        text,
        headingDelimiterRegex
      );
      return headingDelimiterRanges;
    }
  };
};

export default createHeadingDelimiterStyleStrategy;
