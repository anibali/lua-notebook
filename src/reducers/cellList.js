// The initial state is filled with some dummy data for debugging purposes
const initialState = {
  cells: [
    { id: 1, code: 'display_html("Hello")', output: '' }
  ]
};

// The reducer function takes the current state and an action, and returns
// the new state after applying the action.
function reducer(state, action) {
  state = state || initialState;
  action = action || {};

  switch(action.type) {
    default: return state;
  }

  throw new Error('Reducer switch statement should always return');
}

module.exports = reducer;
