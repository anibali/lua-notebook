const ln = require('../build/Release/lua-node');

console.log(ln);

const foo = function() {
  const state = ln.new();
  ln.define_global_function(state, 'display_html', (html_string) => {
    console.log(html_string);
  });

  const lua_code = `
local x = 6
display_html('<strong>' .. (x * 7) .. '</strong>')
`;

  const err = ln.eval(state, lua_code);
  if(err) {
    console.error("Error while evaluating Lua code:");
    console.error(err);
  }
};

foo();
global.gc();
