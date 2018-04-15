'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var createMarkdownDecoratorsPlugin = function createMarkdownDecoratorsPlugin() {

    var H1_REGEX = /(^#{1,6})\s(.*)/gm;
    var h1Strategy = function h1Strategy(contentBlock, callback) {
        var text = contentBlock.getText();
        var matchArr = void 0,
            start = void 0,
            end = void 0;
        while ((matchArr = H1_REGEX.exec(text)) !== null) {
            start = matchArr.index;
            end = start + matchArr[0].length;
            callback(start, end);
        }
    };
    var h1Component = function h1Component(props) {
        return _react2.default.createElement(
            'h1',
            null,
            props.children
        );
    };

    return {
        decorators: [{
            strategy: h1Strategy,
            component: h1Component
        }]
    };
};

exports.default = createMarkdownDecoratorsPlugin;