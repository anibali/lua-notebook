const sconce = require('./build/Release/sconce');

console.log(sconce);

const foo = function() {
  const ss = sconce.sconce_new();
  sconce.sconce_init_lua_state(ss);
  sconce.sconce_define_function(ss, 'js_func', (x) => x * x)
  sconce.sconce_eval(ss, 'print(js_func(7))');
};

foo();
global.gc();
