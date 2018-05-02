import React from 'react';
import ReactDOM from 'react-dom';
import createHeadingDecorator from './decorators/createHeadingDecorator';
import createHeadingDelimiterDecorator from './decorators/createHeadingDelimiterDecorator';

const createMarkdownDecoratorsPlugin = function() {
    return {
        decorators: [
            createHeadingDecorator(),
        ],
    };
};

export default createMarkdownDecoratorsPlugin;
