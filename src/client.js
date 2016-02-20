/**
 * This is the entrypoint for our application in the web browser.
 * When the web page is loaded, this code will run on the client.
 */

const React = require('react');
const ReactDOM = require('react-dom');

// Require our root React component
const Root = require('./components/Root');

window.main = (initialState) => {
  // Mount our React root component in the DOM
  const mountPoint = document.getElementById('root');
  ReactDOM.render(<Root messages={initialState.messages}/>, mountPoint);
}
