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
import createULDelimiterStyleStrategy from './inline-styles/createULDelimiterStyleStrategy';
import createOLDelimiterStyleStrategy from './inline-styles/createOLDelimiterStyleStrategy';
import createQuoteStyleStrategy from './inline-styles/createQuoteStyleStrategy';
import createInlineCodeStyleStrategy from './inline-styles/createInlineCodeStyleStrategy';

// Block type handlers
import createCodeBlockStrategy from './block-types/createCodeBlockStrategy';
import createHeadingBlockStrategy from './block-types/createHeadingBlockStrategy';

const createLiveMarkdownPlugin = function(config = {}) {
  const {
    inlineStyleStrategies = [
      createBoldStyleStrategy(),
      createItalicStyleStrategy(),
      createStrikethroughStyleStrategy(),
      createHeadingDelimiterStyleStrategy(),
      createULDelimiterStyleStrategy(),
      createOLDelimiterStyleStrategy(),
      createQuoteStyleStrategy(),
      createInlineCodeStyleStrategy()
    ],
    blockTypeStrategies = [
      createCodeBlockStrategy(),
      createHeadingBlockStrategy()
    ]
  } = config;

  // Construct the editor style map from our inline style strategies
  const customStyleMap = {};
  inlineStyleStrategies.forEach(styleStrategy => {
    if (styleStrategy.style && styleStrategy.styles)
      customStyleMap[styleStrategy.style] = styleStrategy.styles;
    if (styleStrategy.delimiterStyle && styleStrategy.delimiterStyles)
      customStyleMap[styleStrategy.delimiterStyle] =
        styleStrategy.delimiterStyles;
  });

  // Construct the block style fn
  const blockStyleMap = blockTypeStrategies.reduce((map, blockStrategy) => {
    map[blockStrategy.type] = blockStrategy.className;
    return map;
  }, {});
  const blockStyleFn = block => {
    const blockType = block.getType();
    return blockStyleMap[blockType];
  };

  return {
    // We must handle the maintenance of block types and inline styles on changes.
    // To make sure the code is efficient we only perform maintenance on content
    // blocks that have been changed. We only perform maintenance for change types
    // that result in actual text changes (ignore cursing through text, etc).
    onChange: editorState => {
      return maintainEditorState(editorState, {
        blockTypeStrategies,
        inlineStyleStrategies
      });
    },
    customStyleMap: customStyleMap,
    blockStyleFn: blockStyleFn,
    stripPastedStyles: true
  };
};

// Takes an EditorState and returns a ContentState updated with
const maintainEditorState = (editorState, config) => {
  const { blockTypeStrategies, inlineStyleStrategies } = config;

  // Bypass maintenance if text was not changed
  const lastChangeType = editorState.getLastChangeType();
  const bypassOnChangeTypes = [
    'adjust-depth',
    'apply-entity',
    'change-block-data',
    'change-block-type',
    'change-inline-style',
    'maintain-markdown'
  ];
  if (bypassOnChangeTypes.includes(lastChangeType)) return editorState;

  // Maintain block types then inline styles
  // Order is important bc we want the inline style strategies to be able to
  // look at block type to avoid unnecessary regex searching when possible
  const contentState = editorState.getCurrentContent();
  let newContentState = maintainBlockTypes(contentState, blockTypeStrategies);
  newContentState = maintainInlineStyles(
    newContentState,
    editorState,
    inlineStyleStrategies
  );

  // Apply the updated content state
  let newEditorState = editorState;
  if (contentState !== newContentState)
    newEditorState = EditorState.push(
      editorState,
      newContentState,
      'maintain-markdown'
    );
  newEditorState = EditorState.forceSelection(
    newEditorState,
    editorState.getSelection()
  );

  return newEditorState;
};

// Takes a ContentState and returns a ContentState with block types and inline styles
// applied or removed as necessary
const maintainBlockTypes = (contentState, blockTypeStrategies) => {
  return blockTypeStrategies.reduce((cs, blockTypeStrategy) => {
    return blockTypeStrategy.mapBlockType(cs);
  }, contentState);
};

// Takes a ContentState (and EditorState for getting the selection) and returns
// a ContentState with inline styles applied or removed as necessary
const maintainInlineStyles = (
  contentState,
  editorState,
  inlineStyleStrategies
) => {
  const selection = editorState.getSelection();
  const blockKey = selection.getStartKey();
  const block = contentState.getBlockForKey(blockKey);
  const blockMap = contentState.getBlockMap();

  const newBlock = mapInlineStyles(block, inlineStyleStrategies);
  let newBlockMap = blockMap.set(blockKey, newBlock);

  // If enter was pressed (or the block was otherwise split) we must maintain
  // styles in the previous block as well
  if (editorState.getLastChangeType() === 'split-block') {
    const newPrevBlock = mapInlineStyles(
      contentState.getBlockBefore(blockKey),
      inlineStyleStrategies
    );
    newBlockMap = newBlockMap.set(
      contentState.getKeyBefore(blockKey),
      newPrevBlock
    );
  }

  let newContentState = contentState.merge({
    blockMap: newBlockMap
  });

  return newContentState;
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
    const styleRanges = strategy.findStyleRanges(block);
    const delimiterRanges = strategy.findDelimiterRanges
      ? strategy.findDelimiterRanges(block, styleRanges)
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

export default createLiveMarkdownPlugin;
