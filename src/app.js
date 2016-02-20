const path = require('path');
const express = require('express');

// Create a new Express app
const app = express();

// Serve up our static assets from 'dist' (this includes our client-side
// bundle of JavaScript). These assets are referred to in the HTML using
// <link> and <script> tags.
app.use('/assets', express.static(path.resolve(__dirname, '..', 'dist')));

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
        <div id="root"></div>
        <script src="/assets/js/vendor.js"></script>
        <script src="/assets/js/app.js"></script>
        <script>main(${JSON.stringify(initalState)})</script>
      </body>
    </html>`;

  // Respond with the HTML
  res.send(htmlContent);
});

const threads = require('threads');

const thread = threads.spawn('src/kernel.js')

thread.on('message', (msg) => {
  console.log(msg);
  messages.push(msg);
  // thread.kill();
});

thread.send({ type: 'eval', data: `
local i = 1
while true do
  display_html('Hi #' .. i)
  i = i + 1
  os.execute('sleep 2')
end
` });

// Export the Express app
module.exports = app;
