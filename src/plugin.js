import React from 'react';
import ReactDOM from 'react-dom';
import {
  SelectionState,
  Modifier,
  EditorState,
  CharacterMetadata
} from 'draft-js';
import { OrderedSet, Repeat, List } from 'immutable';
import createHeadingDecorator from './decorators/createHeadingDecorator';

const customStyleMap = {
  STRIKETHROUGH: {
    textDecoration: 'line-through'
  }
};

const createMarkdownDecoratorsPlugin = function() {
  return {
    decorators: [createHeadingDecorator()],
    onChange: (editorState, { setEditorState }) => {
      const selection = editorState.getSelection();
      const blockKey = selection.getStartKey();
      const block = editorState.getCurrentContent().getBlockForKey(blockKey);
      const newBlock = mapInlineStyles(block);
      const contentState = editorState.getCurrentContent();
      const blockMap = contentState.getBlockMap();
      const newBlockMap = blockMap.set(blockKey, newBlock);
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
    customStyleMap: customStyleMap
  };
};

const findRangesWithRegex = (text, regex) => {
  let ranges = [];
  let matches;

  do {
    matches = regex.exec(text);
    if (matches) {
      ranges.push([matches.index, matches.index + matches[0].length - 1]);
    }
  } while (matches);

  return ranges;
};

const boldDelimiters = ['**', '__', '***', '___'];
const boldStyleStrategy = {
  style: 'BOLD',
  delimiters: boldDelimiters,
  find: text => {
    // should return an array of arrays containing start and end indices for
    // ranges of text that should have the style applied
    const boldRegex = /(\*\*\*|___)(.+?)(\*\*\*|___)|(\*\*|__)(.+?)(\*\*|__)/g;
    const boldRanges = findRangesWithRegex(text, boldRegex);
    return boldRanges;
  }
};

const italicDelimiters = ['*', '_', '***', '___'];
const italicStrategy = {
  style: 'ITALIC',
  delimiters: italicDelimiters,
  find: text => {
    const asteriskDelimitedRegex =
      '(?<!\\*)(\\*)(?!\\*)(.+?)(?<!\\*)\\*(?!\\*)'; // *italic*
    const underscoreDelimitedRegex = '(?<!_)(_)(?!_)(.+?)(?<!_)_(?!_)'; // _italic_
    const strongEmphasisRegex = '(\\*\\*\\*|___)(.+?)(\\*\\*\\*|___)'; // ***bolditalic*** ___bolditalic___
    const boldWrappedAsteriskRegex =
      '(?<=\\*\\*)(\\*)(?!\\*)(.*?[^\\*]+)(?<!\\*)\\*(?![^\\*]\\*)|(?<!\\*)(\\*)(?!\\*)(.*?[^\\*]+)(?<!\\*)\\*(?=\\*\\*)'; // ***italic* and bold** **bold and *italic***
    const boldWrappedUnderscoreRegex =
      '(?<=__)(_)(?!_)(.*?[^_]+)(?<!_)_(?![^_]_)|(?<!_)(_)(?!_)(.*?[^_]+)(?<!_)_(?=__)'; // ___italic_ and bold__ __bold and _italic___
    const italicRegex = new RegExp(
      `${asteriskDelimitedRegex}|${underscoreDelimitedRegex}|${strongEmphasisRegex}|${boldWrappedAsteriskRegex}|${boldWrappedUnderscoreRegex}`,
      'g'
    );
    const italicRanges = findRangesWithRegex(text, italicRegex);
    return italicRanges;
  }
};

const strikethroughDelimiters = ['~'];
const strikethroughStrategy = {
  style: 'STRIKETHROUGH',
  delimiters: strikethroughDelimiters,
  find: text => {
    const strikethroughRegex = /(~~)(.+?)(~~)/g;
    const strikethroughRanges = findRangesWithRegex(text, strikethroughRegex);
    return strikethroughRanges;
  }
};

const inlineStyleStrategies = [
  boldStyleStrategy,
  italicStrategy,
  strikethroughStrategy
];

const mapInlineStyles = block => {
  // This will be called upon any change that has the potential to effect the styles
  // of a content block.
  // Find all of the ranges that should have styles applied to them (i.e. all bold,
  // italic, or strikethrough delimited ranges of the block).
  const blockText = block.getText();
  let characterMetadataList = List(
    Repeat(CharacterMetadata.create(), blockText.length)
  );
  inlineStyleStrategies.forEach(strategy => {
    const ranges = strategy.find(blockText);
    ranges.forEach(range => {
      for (let i = range[0]; i <= range[1]; i++) {
        const styled = CharacterMetadata.applyStyle(
          characterMetadataList.get(i),
          strategy.style
        );
        characterMetadataList = characterMetadataList.set(i, styled);
      }
    });
  });

  const newBlock = block.set('characterList', characterMetadataList);

  // Convert the style map to an array of CharacterMetadata
  // Apply the array of CharacterMetadata to the content block
  return newBlock;
};

const findArrayIntersection = (arr1, arr2) => {
  return arr1.filter(function(a) {
    return arr2.has(a);
  });
};

const maintainInlineStyles = editorState => {
  // get the current block
  const selection = editorState.getSelection();
  const blockKey = selection.getStartKey();
  const block = editorState.getCurrentContent().getBlockForKey(blockKey);
  // get block text
  const blockText = block.getText();
  // scan with matching strategies
  const boldStrategy = /\*\*([^(?:**)]+)\*\*/g;
  let matches;
  let newEditorState = editorState;
  do {
    matches = boldStrategy.exec(blockText);
    if (matches) {
      // apply styles accordingly
      newEditorState = applyInlineStyle(editorState, matches, 'BOLD');
    }
  } while (matches);

  return newEditorState;
};

const applyInlineStyle = (editorState, matches, style) => {
  const currentContent = editorState.getCurrentContent();
  const selection = editorState.getSelection();
  const key = selection.getStartKey();
  const { index } = matches;
  const focusOffset = index + matches[0].length;
  const wordSelection = SelectionState.createEmpty(key).merge({
    anchorOffset: index,
    focusOffset
  });
  let newContentState = Modifier.applyInlineStyle(
    currentContent,
    wordSelection,
    style
  );
  let newEditorState = EditorState.push(
    editorState,
    newContentState,
    'change-inline-style'
  );
  const styleOverride = OrderedSet([]);
  newEditorState = EditorState.forceSelection(
    newEditorState,
    editorState.getSelection()
  );
  newEditorState = EditorState.setInlineStyleOverride(
    newEditorState,
    styleOverride
  );
  return EditorState.forceSelection(newEditorState, editorState.getSelection());
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

export default createMarkdownDecoratorsPlugin;
