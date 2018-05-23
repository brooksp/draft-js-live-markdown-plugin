# draft-js-live-markdown-plugin

A [DraftJS](https://facebook.github.io/draft-js/) plugin that styles markdown on the fly without parsing out delimiters. Think of it as markdown syntax highlighting. The plugin works with the popular [DraftJS Plugins](https://github.com/draft-js-plugins/draft-js-plugins) editor. The parsing and styling strategies are configurable to allow for whatever flavor of markdown you are willing to implement beyond the default which is based on Github markdown.

![Preview of plugin functionality](demo.gif)

The aim of this plugin is to provide a better markdown experience by displaying rich markdown text without mutating the plain text. We can add styling to delimiters to allow reducing opacity of bold delimiters, displaying heading delimiters in the gutter to keep the actual header text at the baseline, etc. to improve the look and feel of the editor. Users are able to eliminate the need for two separate (parsed and unparsed) views to see the result of the markdown they write.

## Usage

Simply create the live markdown plugin and include it as a plugin of the `draft-js-plugins-editor` editor. Create and include a Prism plugin as well to be able to take advantage of syntax highlighting in code blocks.

```javascript
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
```

## Supported Markdown Syntax

### Headings

```
# H1
## H2
### H3
#### H4
##### H5
###### H6
```

### Emphasis

```
Bold is delimited with **asterisks** or __underscores__.
Italics is delimited with an *asterisk* or an _underscore_.
Bold plus italic is delimited by ***three asterisks*** or ___three underscores___.
**Bold and *italic* can be partially combined**.
Strikethrough is delimited with ~~two tildes~~.
```

### Lists

```
* Unordered list item
* Another unordered list item

1. Ordered list item
2. Second ordered list item
```

_Note: Nested lists are not currently supported._

### Code Blocks

Code blocks with syntax highlighting are supported. To enable syntax highlighting you must also be using the [draft-js-prism-plugin](https://github.com/withspectrum/draft-js-prism-plugin), as well as having a Prism stylesheet on your page. This is covered in the Usage section above.

```
\`\`\`javascript
// Syntax highlighting based on the specified language
const foo = 'bar';
\`\`\`
```

### Inline Code

```
Use `back-ticks` to delimit inline code.
```

### Blockquotes

```
> There is no "i" in collaboraton.
```
