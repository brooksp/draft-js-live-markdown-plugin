import React from 'react';
import ReactDOM from 'react-dom';
import HeadingDelimiter from './../components/heading/HeadingDelimiter';

const createHeadingDelimiterDecorator = function() {
    const HEADING_DELIMITER_REGEX = /(^#{1,6})\s/gm;

    const headingDelimiterStrategy = function(contentBlock, callback) {
        const text = contentBlock.getText();
        let matchArr, start, end;
        while ((matchArr = HEADING_DELIMITER_REGEX.exec(text)) !== null) {
            start = matchArr.index;
            end = start + matchArr[0].length;
            callback(start, end);
        }
    };

    return {
        strategy: headingDelimiterStrategy,
        component: HeadingDelimiter,
    };
};

export default createHeadingDelimiterDecorator;
