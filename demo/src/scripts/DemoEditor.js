import React, { Component } from 'react';
import { EditorState, ContentState } from 'draft-js';
import Editor from 'draft-js-plugins-editor';
import createLiveMarkdownPlugin from 'draft-js-live-markdown-plugin';
import Prism from 'prismjs';
import createPrismPlugin from 'draft-js-prism-plugin';

const initialContentState = ContentState.createFromText(
  `# Welcome to the Demo
> Think of it as a markdown syntax highlighter.

Try typing some **markdown** to see how the \`plugin\` behaves. The plugin supports lots of markdown syntax *including*:
## Code Blocks
\`\`\`javascript
// With syntax highlighting
const foo = () => 'bar';
\`\`\`
## Lists
* Both unordered lists
* and...

1. Ordered lists
2. Are supported`
);
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
