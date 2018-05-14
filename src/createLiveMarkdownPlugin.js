import React from 'react';
import ReactDOM from 'react-dom';
import {
  SelectionState,
  Modifier,
  EditorState,
  CharacterMetadata
} from 'draft-js';
import { OrderedSet, Repeat, List } from 'immutable';

// Inline style handlers
import createBoldStyleStrategy from './inline-styles/createBoldStyleStrategy';
import createItalicStyleStrategy from './inline-styles/createItalicStyleStrategy';
import createStrikethroughStyleStrategy from './inline-styles/createStrikethroughStyleStrategy';
import createHeadingDelimiterStyleStrategy from './inline-styles/createHeadingDelimiterStyleStrategy';

// Block level decorators
import createHeadingDecorator from './decorators/createHeadingDecorator';

// Utils
import findRangesWithRegex from './utils/findRangesWithRegex';

const customStyleMap = {
  STRIKETHROUGH: {
    textDecoration: 'line-through'
  },
  'STRIKETHROUGH-DELIMITER': {
    opacity: 0.4,
    textDecoration: 'none'
  },
  'BOLD-DELIMITER': {
    opacity: 0.4
  },
  'ITALIC-DELIMITER': {
    opacity: 0.4
  },
  'HEADING-DELIMITER': {
    opacity: 0.4,
    display: 'inline-block',
    position: 'absolute',
    transform: 'translateX(-100%)'
  }
};

const createLiveMarkdownPlugin = function(config = {}) {
  const {
    inlineStyleStrategies = [
      createBoldStyleStrategy(),
      createItalicStyleStrategy(),
      createStrikethroughStyleStrategy(),
      createHeadingDelimiterStyleStrategy()
    ]
  } = config;

  return {
    decorators: [createHeadingDecorator()],
    onChange: (editorState, { setEditorState }) => {
      // Maintain the inline styles after changes are made
      const selection = editorState.getSelection();
      const blockKey = selection.getStartKey();
      const block = editorState.getCurrentContent().getBlockForKey(blockKey);
      const contentState = editorState.getCurrentContent();
      const blockMap = contentState.getBlockMap();

      const newBlock = mapInlineStyles(block, inlineStyleStrategies);
      let newBlockMap = blockMap.set(blockKey, newBlock);

      // If enter was pressed (or the block was otherwise split) we must maintain
      // styles in the previous block as well
      const lastChangeType = editorState.getLastChangeType();
      if (lastChangeType === 'split-block') {
        const newPrevBlock = mapInlineStyles(
          contentState.getBlockBefore(blockKey),
          inlineStyleStrategies
        );
        newBlockMap = newBlockMap.set(
          contentState.getKeyBefore(blockKey),
          newPrevBlock
        );
      }

      const newContentState = contentState.merge({
        blockMap: newBlockMap
      });
      let newEditorState = EditorState.push(
        editorState,
        newContentState,
        'insert-characters'
      );
      newEditorState = EditorState.forceSelection(newEditorState, selection);

      return newEditorState;
    },
    customStyleMap: customStyleMap,
    stripPastedStyles: true
  };
};

// Maps inline styles to the provided ContentBlock's CharacterMetadata list based
// on the plugin's inline style strategies
const mapInlineStyles = (block, strategies) => {
  // This will be called upon any change that has the potential to effect the styles
  // of a content block.
  // Find all of the ranges that should have styles applied to them (i.e. all bold,
  // italic, or strikethrough delimited ranges of the block).
  const blockText = block.getText();

  // Create a list of empty CharacterMetadata to map styles to
  let characterMetadataList = List(
    Repeat(CharacterMetadata.create(), blockText.length)
  );

  // Evaluate block text with each style strategy and apply styles to matching
  // ranges of text and delimiters
  strategies.forEach(strategy => {
    const styleRanges = strategy.findStyleRanges(blockText);
    const delimiterRanges = strategy.findDelimiterRanges
      ? strategy.findDelimiterRanges(blockText, styleRanges)
      : [];

    characterMetadataList = applyStyleRangesToCharacterMetadata(
      strategy.style,
      styleRanges,
      characterMetadataList
    );

    characterMetadataList = applyStyleRangesToCharacterMetadata(
      strategy.delimiterStyle,
      delimiterRanges,
      characterMetadataList
    );
  });

  // Apply the list of CharacterMetadata to the content block
  return block.set('characterList', characterMetadataList);
};

// Applies the provided style to the corresponding ranges of the character metadata
const applyStyleRangesToCharacterMetadata = (
  style,
  ranges,
  characterMetadataList
) => {
  let styledCharacterMetadataList = characterMetadataList;
  ranges.forEach(range => {
    for (let i = range[0]; i <= range[1]; i++) {
      const styled = CharacterMetadata.applyStyle(
        characterMetadataList.get(i),
        style
      );
      styledCharacterMetadataList = styledCharacterMetadataList.set(i, styled);
    }
  });
  return styledCharacterMetadataList;
};

const findArrayIntersection = (arr1, arr2) => {
  return arr1.filter(function(a) {
    return arr2.has(a);
  });
};

const handleBeforeInput = (character, editorState, setEditorState) => {
  // By default the Draft editor looks to the left of the cursor and applies
  // those styles to newly inserted text. This is bad for our markdown
  // plugin because we want only text inserted between delimiters to have
  // styles applied to it.

  // Handle this by only applying styles that are present to both the
  // left and the right of the cursor.

  const content = editorState.getCurrentContent();
  const selection = editorState.getSelection();
  const startBlockKey = selection.getStartKey();
  const endBlockKey = selection.getEndKey();
  const startBlock = content.getBlockForKey(startBlockKey);
  const endBlock = content.getBlockForKey(endBlockKey);
  const selectionStart = selection.getStartOffset();
  const selectionEnd = selection.getEndOffset();

  // If selection is at the start/end of a line we can safely assume the text
  // will not be delimited and therefore unstyled.
  if (selectionStart === 0 || selectionEnd === endBlock.getText().length) {
    const newContent = Modifier.insertText(
      content,
      selection,
      character,
      OrderedSet([]),
      startBlock.getEntityAt(selectionStart)
    );
    const newEditorState = EditorState.push(
      editorState,
      newContent,
      'insert-characters'
    );

    setEditorState(newEditorState);
    return 'handled';
  }

  // Get arrays of styles for left and right of cursor
  const startStyles = startBlock.getInlineStyleAt(selectionStart - 1);
  const endStyles = endBlock.getInlineStyleAt(selectionEnd);

  // Reduce the arrays to only common styles
  const stylesToApply = findArrayIntersection(startStyles, endStyles);

  // If common styles array is same length then take no action
  if (stylesToApply.length === startStyles.length) {
    return 'not-handled';
  }

  // Otherwise we must manually insert the text with the common styles
  const newContent = Modifier.insertText(
    content,
    selection,
    character,
    stylesToApply,
    startBlock.getEntityAt(selectionStart)
  );
  const newEditorState = EditorState.push(
    editorState,
    newContent,
    'insert-characters'
  );

  setEditorState(newEditorState);
  return 'handled';
};

export default createLiveMarkdownPlugin;
