const sconce = require('./build/Release/sconce');

console.log(sconce);

const foo = function() {
  const ss = sconce.sconce_new();
  sconce.sconce_init_lua_state(ss);
  sconce.sconce_define_function(ss, 'js_func', () => 23)
  sconce.sconce_eval(ss, 'print(js_func())');
};

foo();

global.gc();
