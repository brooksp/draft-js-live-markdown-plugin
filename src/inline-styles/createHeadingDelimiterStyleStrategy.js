import findRangesWithRegex from '../utils/findRangesWithRegex';

const createHeadingDelimiterStyleStrategy = () => {
  const headingDelimiterRegex = /(^#{1,6})\s/g;

  return {
    style: 'HEADING-DELIMITER',
    findStyleRanges: block => {
      const text = block.getText();
      const headingDelimiterRanges = findRangesWithRegex(
        text,
        headingDelimiterRegex
      );
      return headingDelimiterRanges;
    },
    styles: {
      opacity: 0.4,
      position: 'absolute',
      transform: 'translateX(-100%)'
    }
  };
};

export default createHeadingDelimiterStyleStrategy;
