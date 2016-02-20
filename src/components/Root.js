const React = require('react');

const MessageItem = (m) => {
  return (
    <div className="well" key={m.id} dangerouslySetInnerHTML={{__html: m.data}} />
  );
};

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
      <div style={{paddingTop: '16px'}}>{this.props.messages.map(MessageItem)}</div>
    );
  }
});

// Export the Root component
module.exports = Root;
