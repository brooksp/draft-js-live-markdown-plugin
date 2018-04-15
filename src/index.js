import React from 'react';
import ReactDOM from 'react-dom';

const createMarkdownDecoratorsPlugin = function() {

    const H1_REGEX = /(^#{1,6})\s(.*)/gm;
    const h1Strategy = function(contentBlock, callback) {
        const text = contentBlock.getText();
        let matchArr, start, end;
        while ((matchArr = H1_REGEX.exec(text)) !== null) {
            start = matchArr.index;
            end = start + matchArr[0].length;
            callback(start, end);
        }
    }
    const h1Component = function(props) {
        return (
            <h1>{props.children}</h1>
        );
    }

    return {
        decorators: [{
            strategy: h1Strategy,
            component: h1Component,
        }],
    };
};

export default createMarkdownDecoratorsPlugin;
