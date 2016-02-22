/**
 * This is the entrypoint for our application in the web browser.
 * When the web page is loaded, this code will run on the client.
 */

require('whatwg-fetch');

const React = require('react');
const ReactDOM = require('react-dom');
const Redux = require('redux');

// Require our root React component
const Root = require('./components/Root');

const reducers = require('./reducers');

window.main = (initialState) => {
  // Create a Redux store
  const store = Redux.createStore(reducers, initialState);

  // Mount our React root component in the DOM
  const mountPoint = document.getElementById('root');
  ReactDOM.render(<Root store={store} />, mountPoint);
};
