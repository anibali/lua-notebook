const React = require('react');

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
      <pre>{this.props.messages.map((m) => m.data).join('\n')}</pre>
    );
  }
});

// Export the Root component
module.exports = Root;
