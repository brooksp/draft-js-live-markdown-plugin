import React from 'react';
import ReactDOM from 'react-dom';

import DemoEditor from './DemoEditor';

// Only render in the browser
if (typeof document !== 'undefined') {
  ReactDOM.render(
    <div className="container">
      <div className="container__title">Enter some Markdown below:</div>
      <DemoEditor />
    </div>,
    document.getElementById('app')
  );
}
