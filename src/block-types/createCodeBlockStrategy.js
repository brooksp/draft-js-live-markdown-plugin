import { Modifier, SelectionState } from 'draft-js';

import findRangesWithRegex from '../utils/findRangesWithRegex';

const createCodeBlockStrategy = () => {
  const blockType = 'code-block';
  const codeBlockRegex = /^```/g;

  return {
    type: blockType,
    className: 'code-block',
    mapBlockType: contentState => {
      // Takes a ContentState and returns a ContentState with code block content
      // block type applied
      const blockMap = contentState.getBlockMap();
      let newContentState = contentState;
      let codeBlockKeys = [];
      let notCodeBlockKeys = [];
      let tempKeys = [];

      // Find all code blocks
      blockMap.forEach((block, blockKey) => {
        const text = block.getText();
        const codeBlockDelimiterRanges = findRangesWithRegex(
          text,
          codeBlockRegex
        );
        const precededByDelimiter = tempKeys.length > 0;

        // If we find the opening code block delimiter we must maintain an array
        // of all keys for content blocks that might need to be code blocks if we
        // later find a closing code block delimiter
        if (codeBlockDelimiterRanges.length > 0 || precededByDelimiter) {
          tempKeys.push(blockKey);
        } else {
          notCodeBlockKeys.push(blockKey);
        }

        // If we find the closing code block delimiter ``` then store the keys for
        // the sandwiched content blocks
        if (codeBlockDelimiterRanges.length > 0 && precededByDelimiter) {
          codeBlockKeys = codeBlockKeys.concat(tempKeys);
          tempKeys = [];
        }
      });

      // Loop through keys for blocks that should not have code block type and remove
      // code block type if necessary
      notCodeBlockKeys = notCodeBlockKeys.concat(tempKeys);
      notCodeBlockKeys.forEach(blockKey => {
        if (newContentState.getBlockForKey(blockKey).getType() === blockType)
          newContentState = Modifier.setBlockType(
            newContentState,
            SelectionState.createEmpty(blockKey),
            'unstyled'
          );
      });

      // Loop through found code block keys and apply the block style to each block
      codeBlockKeys.forEach(blockKey => {
        newContentState = Modifier.setBlockType(
          newContentState,
          SelectionState.createEmpty(blockKey),
          blockType
        );
      });

      return newContentState;
    }
  };
};

export default createCodeBlockStrategy;
