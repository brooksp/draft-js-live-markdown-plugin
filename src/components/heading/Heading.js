import React from 'react';

const Heading = props => {
  const { decoratedText } = props;

  // Count the number of # to determine the heading level
  const headingLevel = (decoratedText.match(/#/g) || []).length;
  const HeadingTag = `h${headingLevel}`;

  return <HeadingTag>{props.children}</HeadingTag>;
};

export default Heading;
