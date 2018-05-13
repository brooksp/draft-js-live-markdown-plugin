import createLiveMarkdownPlugin from './createLiveMarkdownPlugin';

// Inline style handlers
import createBoldStyleStrategy from './inline-styles/createBoldStyleStrategy';
import createItalicStyleStrategy from './inline-styles/createItalicStyleStrategy';
import createStrikethroughStyleStrategy from './inline-styles/createStrikethroughStyleStrategy';

export default createLiveMarkdownPlugin;

export {
  createBoldStyleStrategy,
  createItalicStyleStrategy,
  createStrikethroughStyleStrategy
};
