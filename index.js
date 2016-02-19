const sconce = require('./build/Release/sconce');

console.log(sconce);

const foo = function() {
  let buf = sconce.sconce_new();
  sconce.sconce_init_lua_state(buf);
  sconce.sconce_eval(buf, "print('hello')");
};

foo();

global.gc();
