const _ = require('lodash');

const CHANGE_CODE = Symbol('sconce/cellList/CHANGE_CODE');

// The initial state is filled with some dummy data for debugging purposes
const initialState = {
  cells: [
    { id: 1, code: 'display_html("Hello")', output: [] }
  ]
};

// The reducer function takes the current state and an action, and returns
// the new state after applying the action.
function reducer(state, action) {
  state = state || initialState;
  action = action || {};

  switch(action.type) {
    case CHANGE_CODE: {
      const cells = _.mapValues(state.cells, (cell) => {
        if(cell.id === action.cellId) {
          return _.assign({}, cell, { code: action.code });
        }
        return cell;
      });
      return _.assign({}, state, { cells });
    }

    default: return state;
  }

  throw new Error('Reducer switch statement should always return');
}

reducer.changeCode = (cellId, code) =>
  ({ type: CHANGE_CODE, cellId, code });

module.exports = reducer;
