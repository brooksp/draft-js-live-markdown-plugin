import React, { Component } from 'react';
import { EditorState, ContentState } from 'draft-js';
import Editor from 'draft-js-plugins-editor';
import createLiveMarkdownPlugin from 'draft-js-live-markdown-plugin';
import Prism from 'prismjs';
import createPrismPlugin from 'draft-js-prism-plugin';

const initialContentState = ContentState.createFromText('');
const initialEditorState = EditorState.createWithContent(initialContentState);

const plugins = [
  createLiveMarkdownPlugin(),
  createPrismPlugin({ prism: Prism })
];

export default class DemoEditor extends Component {
  state = {
    editorState: EditorState.createWithContent(initialContentState)
  };

  render() {
    const { editorState } = this.state;
    return (
      <Editor
        editorState={editorState}
        onChange={this.handleChange}
        plugins={plugins}
      />
    );
  }

  handleChange = editorState => {
    this.setState({ editorState });
  };
}
