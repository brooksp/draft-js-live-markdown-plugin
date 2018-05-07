import React, { Component } from 'react';
import { EditorState, ContentState } from 'draft-js';
import Editor from 'draft-js-plugins-editor';
import createMarkdownDecoratorsPlugin from 'draft-js-markdown-decorators-plugin';

const initialContentState = ContentState.createFromText('');
const initialEditorState = EditorState.createWithContent(initialContentState);

const plugins = [createMarkdownDecoratorsPlugin()];

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
