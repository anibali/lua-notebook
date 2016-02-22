const React = require('react');
const ReactRedux = require('react-redux');

const Provider = ReactRedux.Provider;

const CellList = require('./CellList');

/**
 * The root React component from which all other components
 * on the page are descended.
 */
const Root = React.createClass({
  // Display name for the component (useful for debugging)
  displayName: 'Root',

  // Describe how to render the component
  render: function() {
    return (
      <Provider store={this.props.store}>
        <CellList />
      </Provider>
    );
  }
});

// Export the Root component
module.exports = Root;
