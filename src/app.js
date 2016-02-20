const path = require('path');
const express = require('express');
const threads = require('threads');
const bodyParser = require('body-parser');

// Create a new Express app
const app = express();

app.use(bodyParser.json());

// Serve up our static assets from 'dist' (this includes our client-side
// bundle of JavaScript). These assets are referred to in the HTML using
// <link> and <script> tags.
app.use('/assets', express.static(path.resolve(__dirname, '..', 'dist')));

require('./config/routes').connect(app);

const messages = [];

// Set up the root route
app.get('/', (req, res) => {
  const initalState = {
    messages: messages
  };

  // The HTML is pretty barebones, it just provides a mount point
  // for React and links to our styles and scripts.
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <link rel="stylesheet" type="text/css" href="/assets/css/app.css">
      </head>
      <body>
        <div class="container" id="root"></div>
        <script src="/assets/js/vendor.js"></script>
        <script src="/assets/js/app.js"></script>
        <script>main(${JSON.stringify(initalState)})</script>
      </body>
    </html>`;

  // Respond with the HTML
  res.send(htmlContent);
});

const kernel = threads.spawn('src/kernel.js')

kernel.on('message', (msg) => {
  msg.id = messages.length + 1
  messages.push(msg);
  // kernel.kill();
});

global.kernel = kernel;

// Export the Express app
module.exports = app;
