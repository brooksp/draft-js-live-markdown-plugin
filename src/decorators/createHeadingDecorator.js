import React from 'react';
import ReactDOM from 'react-dom';
import Heading from './../components/heading/Heading';

const createHeadingDecorator = function() {
  const HEADING_REGEX = /(^#{1,6})\s(.*)/gm;

  const headingStrategy = function(contentBlock, callback) {
    const text = contentBlock.getText();
    let matchArr, start, end;
    while ((matchArr = HEADING_REGEX.exec(text)) !== null) {
      start = matchArr.index;
      end = start + matchArr[0].length;
      callback(start, end);
    }
  };

  return {
    strategy: headingStrategy,
    component: Heading
  };
};

export default createHeadingDecorator;
