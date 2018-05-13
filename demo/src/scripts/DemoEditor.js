import React, { Component } from 'react';
import { EditorState, ContentState } from 'draft-js';
import Editor from 'draft-js-plugins-editor';
import createLiveMarkdownPlugin from 'draft-js-live-markdown-plugin';

const initialContentState = ContentState.createFromText('');
const initialEditorState = EditorState.createWithContent(initialContentState);

const plugins = [createLiveMarkdownPlugin()];

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
