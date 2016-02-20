const React = require('react');
const ReactRedux = require('react-redux');

require('brace');
require('brace/mode/lua');
require('brace/theme/monokai');

const AceEditor = require('react-ace');

const MessageItem = (m) => {
  return (
    <div className="well" key={m.id} dangerouslySetInnerHTML={{ __html: m.data }} />
  );
};

const CellList = React.createClass({
  // Display name for the component (useful for debugging)
  displayName: 'CellList',

  getInitialState: function() {
    return { code: this.props.cells[0].code };
  },

  // Describe how to render the component
  render: function() {
    const onChange = (newValue) => {
      this.setState({ code: newValue });
    };

    const onLoad = (editor) => {
      editor.setShowInvisibles(true);
    };

    const onClick = () => {
      fetch('/api/eval', {
        method: 'post',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: this.state.code
        })
      });
    };

    return (
      <div style={{ paddingTop: '16px' }}>
        <AceEditor
          width="100%"
          fontSize={16}
          mode="lua"
          theme="monokai"
          tabSize={2}
          onChange={onChange}
          onLoad={onLoad}
          name="UNIQUE_ID_OF_DIV"
          value={this.state.code}
          editorProps={{ $blockScrolling: true }}
        />
        <a className="btn btn-primary" role="button" onClick={onClick}>Eval</a>
        {this.props.messages.map(MessageItem)}
      </div>
    );
  }
});

module.exports = ReactRedux.connect(
  // Map store state to props
  (state) => ({
    cells: state.cellList.cells
  })
)(CellList);
