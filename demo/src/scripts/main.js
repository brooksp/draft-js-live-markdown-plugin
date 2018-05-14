import React from 'react';
import ReactDOM from 'react-dom';

import DemoEditor from './DemoEditor';

// Only render in the browser
if (typeof document !== 'undefined') {
  ReactDOM.render(
    <div className="demo">
      <div className="demo__title">Enter some Markdown below:</div>
      <div className="demo__editor-container">
        <DemoEditor />
      </div>
    </div>,
    document.getElementById('app')
  );
}
