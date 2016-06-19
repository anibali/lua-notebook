const _ = require('lodash');
const React = require('react');
const ReactRedux = require('react-redux');

require('brace');
require('brace/mode/lua');
require('brace/theme/monokai');

const AceEditor = require('react-ace');

const cellListActionCreators = require('../reducers/cellList');

const MessageItem = (m) => (
  <div
    className="well"
    key={m.id}
    dangerouslySetInnerHTML={{ __html: m.data }}
  />
);

const Cell = React.createClass({
  // Display name for the component (useful for debugging)
  displayName: 'Cell',

  loadOutputFromServer: function() {
    fetch('/api/output', {
      method: 'get',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    .then((res) => res.json())
    .then((json) => {
      this.props.onOutputChange(json.output);
    });
  },

  componentDidMount: function() {
    this.loadOutputFromServer();
    setInterval(this.loadOutputFromServer, 1000);
  },

  render: function() {
    const onLoad = (editor) => {
      editor.setShowInvisibles(true);
      editor.renderer.setScrollMargin(6, 6, 6, 6);
    };

    const onClickRun = () => {
      fetch('/api/eval', {
        method: 'post',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: this.props.code
        })
      });
    };

    const onClickKill = () => {
      alert('TODO');
    }

    return (
      <div>
        <div className="btn-toolbar" role="toolbar" aria-label="...">
          <div className="btn-group" role="group">
            <a className="btn btn-default" role="button" onClick={onClickRun}>
              <span className="fa fa-play" />
            </a>
            <a className="btn btn-danger" role="button" onClick={onClickKill}>
              <span className="fa fa-ban" />
            </a>
          </div>
        </div>
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
        <Cell code={this.props.cells[0].code} onCodeChange={_.partial(this.props.changeCode, 1)} onOutputChange={_.partial(this.props.changeOutput, 1)} />
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
    changeCode: _.flow(cellListActionCreators.changeCode, dispatch),
    changeOutput: _.flow(cellListActionCreators.changeOutput, dispatch)
  })
)(CellList);
