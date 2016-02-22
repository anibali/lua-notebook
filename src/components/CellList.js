const _ = require('lodash');
const React = require('react');
const ReactRedux = require('react-redux');

require('brace');
require('brace/mode/lua');
require('brace/theme/monokai');

const AceEditor = require('react-ace');

const cellListActionCreators = require('../reducers/cellList');

const MessageItem = (m) => {
  return (
    <div className="well" key={m.id} dangerouslySetInnerHTML={{ __html: m.data }} />
  );
};

const Cell = React.createClass({
  // Display name for the component (useful for debugging)
  displayName: 'Cell',

  render: function() {
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
          code: this.props.code
        })
      }).then(() => {
        // TODO: Don't do this, obviously.
        location.reload();
      });
    };

    return (
      <div>
        <AceEditor
          width="100%"
          fontSize={16}
          mode="lua"
          theme="monokai"
          tabSize={2}
          onChange={this.props.onCodeChange}
          onLoad={onLoad}
          name="UNIQUE_ID_OF_DIV"
          value={this.props.code}
          editorProps={{ $blockScrolling: true }}
        />
        <a className="btn btn-primary" role="button" onClick={onClick}>Eval</a>
      </div>
    );
  }
});

const CellList = React.createClass({
  // Display name for the component (useful for debugging)
  displayName: 'CellList',

  // Describe how to render the component
  render: function() {
    return (
      <div style={{ paddingTop: '16px' }}>
        <Cell code={this.props.cells[0].code} onCodeChange={_.partial(this.props.changeCode, 1)} />
        {this.props.cells[0].output.map(MessageItem)}
      </div>
    );
  }
});

module.exports = ReactRedux.connect(
  // Map store state to props
  (state) => ({
    cells: state.cellList.cells
  }),

  (dispatch) => ({
    changeCode: _.flow(cellListActionCreators.changeCode, dispatch)
  })
)(CellList);
