const sconce = require('./build/Release/sconce');

console.log(sconce);

const foo = function() {
  const ss = sconce.sconce_new();
  sconce.sconce_init_lua_state(ss);
  sconce.sconce_define_function(ss, 'js_func', (x) => x)

  const err = sconce.sconce_eval(ss, 'print(js_func("Hello"))');
  if(err) {
    console.error("Error while evaluating Lua code:");
    console.error(err);
  }
};

foo();
global.gc();
