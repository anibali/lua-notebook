const ln = require('../build/Release/lua-node');

const state = ln.new();

const main = (input, done) => {
  input = input || {}

  const display_html = (html_string) => {
    done({ type: 'display_html', data: html_string });
  };

  ln.define_global_function(state, 'display_html', display_html);

  switch(input.type) {
    case 'eval': {
      const err = ln.eval(state, input.data);
      if(err) {
        done({ type: 'error', data: err });
      }
    } break;
  }
};

module.exports = main;
