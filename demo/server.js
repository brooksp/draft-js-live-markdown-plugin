const express = require('express');
const path = require('path');
const lessMiddleware = require('less-middleware');

const app = express();

const SRC_DIR = path.join(__dirname, 'src');
const PUBLIC_DIR = path.join(__dirname, 'public');
const PORT = 3000;

// Transpile Less files to CSS
app.use(
  lessMiddleware(SRC_DIR, {
    dest: PUBLIC_DIR,
    force: true,
    debug: true
  })
);

// Serve static resources (CSS, JS)
app.use(express.static(PUBLIC_DIR));

// Return index.html for all requests
app.get('*', (req, res) => {
  console.log('Returning index');
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Serving the demo on localhost:3000`);
  console.log(__dirname);
});
