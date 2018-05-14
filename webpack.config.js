const path = require('path');

const DIST_DIR = path.join(__dirname, 'dist');
const SRC_DIR = path.join(__dirname, 'src');
const PLUGIN_ENTRY = path.join(SRC_DIR, 'index');
const DEMO_DIR = path.join(__dirname, 'demo');
const DEMO_ENTRY = path.join(DEMO_DIR, 'src', 'scripts', 'main');
const DEMO_PUBLIC_DIR = path.join(DEMO_DIR, 'public', 'scripts');
const PLUGIN_DIR = path.join(__dirname, 'src', 'index');

module.exports = [
  {
    entry: PLUGIN_ENTRY,
    mode: 'development',
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader'
          }
        }
      ]
    },
    output: {
      path: DIST_DIR,
      filename: 'bundle.js'
    }
  },
  {
    entry: DEMO_ENTRY,
    mode: 'development',
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader'
          }
        }
      ]
    },
    output: {
      path: DEMO_PUBLIC_DIR,
      filename: 'main.js'
    },
    resolve: {
      alias: {
        'draft-js-live-markdown-plugin': path.join(PLUGIN_DIR)
      }
    }
  }
];
