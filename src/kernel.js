const ln = require('../build/Release/lua-node');

const luaNodeState = ln.new();

const main = (input, done) => {
  input = input || {};

  const displayHtml = (htmlString) => {
    done({ type: 'display_html', data: htmlString });
  };

  ln.define_global_function(luaNodeState, 'display_html', displayHtml);

  switch(input.type) {
    case 'eval': {
      const err = ln.eval(luaNodeState, input.data);
      if(err) {
        done({ type: 'error', data: err });
      }
    } break;

    default: {
      console.error('Unrecognised kernel thread input message');
    } break;
  }
};

module.exports = main;
