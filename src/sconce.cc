#include <nan.h>

#include <string.h>
#include <vector>

using namespace v8;
using namespace std;

extern "C" {
  #include <lua.h>
  #include <lauxlib.h>
  #include <lualib.h>
}

template<typename T>
static Nan::MaybeLocal<T> wrap_maybe_local(Local<T> l) {
  return Nan::MaybeLocal<T>(l);
}

template<typename T>
static Nan::MaybeLocal<T> wrap_maybe_local(Nan::MaybeLocal<T> l) {
  return l;
}

bool check_number_of_args(const Nan::FunctionCallbackInfo<v8::Value>& info, int n_args) {
  if(info.Length() != n_args) {
    char msg[100];
    snprintf(msg, sizeof(msg), "Expected %d argument(s), got %d", n_args, info.Length());
    Nan::ThrowTypeError(msg);
    return false;
  }

  return true;
}

typedef struct {
  lua_State* L;
  vector<Nan::Callback*> callbacks;
} Sconce_State;

void destroy_sconce_state(char *data, void *hint) {
  Sconce_State* ss = (Sconce_State*)data;

  // Close Lua state if present
  if(ss->L) {
    lua_close(ss->L);
    ss->L = NULL;
  }

  // Allow callbacks to be GC'd by V8
  for(auto it = ss->callbacks.begin(); it != ss->callbacks.end(); it++) {
    delete *it;
  }
  ss->callbacks.clear();

  free(data);
}

void sconce_new(const Nan::FunctionCallbackInfo<v8::Value>& info) {
  if(!check_number_of_args(info, 0)) return;

  Sconce_State* ss = (Sconce_State*)calloc(1, sizeof(Sconce_State));
  Local<Object> buffer =
    Nan::NewBuffer((char*)ss, sizeof(Sconce_State), destroy_sconce_state, NULL).ToLocalChecked();

  info.GetReturnValue().Set(buffer);
}

void sconce_init_lua_state(const Nan::FunctionCallbackInfo<v8::Value>& info) {
  if(!check_number_of_args(info, 1)) return;

  if(!info[0]->IsObject()) {
    Nan::ThrowTypeError("Wrong argument type(s)");
    return;
  }

  Local<Object> buffer = info[0]->ToObject();
  Sconce_State* ss = (Sconce_State*)node::Buffer::Data(buffer);

  ss->L = luaL_newstate();
  luaL_openlibs(ss->L);
}

// Retrieves a Lua value from the Lua stack and converts it into a JS value
static Nan::MaybeLocal<Value> lua_to_js_value(lua_State *L, int index) {
  switch(lua_type(L, index)) {
    case LUA_TNIL: {
      return Nan::Undefined();
      break;
    };

    case LUA_TNUMBER: {
      return Nan::New(lua_tonumber(L, index));
    } break;

    case LUA_TBOOLEAN: {
      return Nan::New(lua_toboolean(L, index) ? true : false);
    } break;

    case LUA_TSTRING: {
      auto maybe_string = Nan::New(lua_tostring(L, index));
      if(maybe_string.IsEmpty()) {
        return Nan::MaybeLocal<Value>();
      } else {
        return maybe_string.ToLocalChecked();
      }
    } break;

    default: {
      return Nan::MaybeLocal<Value>();
    }
  }
}

// Converts a JS value into a Lua value and pushes it onto the Lua stack
static bool js_to_lua_value(lua_State *L, Local<Value> js_value) {
  if(js_value->IsUndefined() || js_value->IsNull()) {
    lua_pushnil(L);
  } else if(js_value->IsNumber()) {
    lua_pushnumber(L, js_value->NumberValue());
  } else if(js_value->IsBoolean()) {
    lua_pushboolean(L, js_value->BooleanValue() ? 1 : 0);
  } else if(js_value->IsString()) {
    Nan::Utf8String string_result(js_value);
    lua_pushstring(L, *string_result);
  } else {
    return false;
  }

  return true;
}

int call_js_function(lua_State *L) {
  int n_args = lua_gettop(L);

  // Get JS function from upvalue
  Nan::Callback* callback = (Nan::Callback*)lua_touserdata(L, lua_upvalueindex(1));

  // Convert args Lua->JS
  Local<Value> argv[n_args];
  for(int i = 1; i <= n_args; ++i) {
    Nan::MaybeLocal<Value> value = lua_to_js_value(L, i);
    if(value.IsEmpty()) {
      return luaL_error(L, "[SCONCE] Unsupported arg type");
    }
    argv[i - 1] = value.ToLocalChecked();
  }

  // Call the JS function
  Local<Value> result = callback->Call(n_args, argv);

  // Convert result JS->Lua
  if(!js_to_lua_value(L, result)) {
    return luaL_error(L, "[SCONCE] Unsupported return type");
  }

  // Return number of results
  return 1;
}

void sconce_define_function(const Nan::FunctionCallbackInfo<v8::Value>& info) {
  if(!check_number_of_args(info, 3)) return;

  if(!info[0]->IsObject() || !info[1]->IsString() || !info[2]->IsFunction()) {
    Nan::ThrowTypeError("Wrong argument type(s)");
    return;
  }

  Local<Object> buffer = info[0]->ToObject();
  Sconce_State* ss = (Sconce_State*)node::Buffer::Data(buffer);

  Nan::Utf8String function_name(info[1].As<Object>());

  Local<Function> callbackHandle = info[2].As<Function>();
  Nan::Callback* callback = new Nan::Callback(callbackHandle);
  ss->callbacks.push_back(callback);

  lua_pushlightuserdata(ss->L, callback);
  lua_pushcclosure(ss->L, call_js_function, 1);
  lua_setglobal(ss->L, *function_name);
}

static int errfunc(lua_State *L) {
  luaL_traceback(L, L, lua_tostring(L, 1), 0);
  return 1;
}

void sconce_eval(const Nan::FunctionCallbackInfo<v8::Value>& info) {
  if(!check_number_of_args(info, 2)) return;

  if(!info[0]->IsObject() || !info[1]->IsString()) {
    Nan::ThrowTypeError("Wrong argument type(s)");
    return;
  }

  Local<Object> buffer = info[0]->ToObject();
  Sconce_State* ss = (Sconce_State*)node::Buffer::Data(buffer);

  Nan::Utf8String code(info[1].As<Object>());

  lua_pushcfunction(ss->L, errfunc);
  bool is_error = luaL_loadstring(ss->L, *code) || lua_pcall(ss->L, 0, LUA_MULTRET, 1);

  if(is_error) {
    info.GetReturnValue().Set(Nan::New(lua_tostring(ss->L, -1)).ToLocalChecked());
  } else {
    info.GetReturnValue().Set(Nan::Undefined());
  }
}

template<typename K, typename V>
static void set_prop(Handle<Object> obj, Local<K> key, Local<V> value) {
  obj->Set(
    Nan::MaybeLocal<K>(key).ToLocalChecked(),
    Nan::MaybeLocal<V>(value).ToLocalChecked());
}

template<typename K, typename V>
static void set_prop(Handle<Object> obj, K key, Local<V> value) {
  set_prop(obj,
    wrap_maybe_local(Nan::New(key)).ToLocalChecked(),
    value);
}

template<typename K, typename V>
static void set_prop(Handle<Object> obj, Local<K> key, V value) {
  set_prop(obj,
    key,
    wrap_maybe_local(Nan::New(value)).ToLocalChecked());
}

template<typename K, typename V>
static void set_prop(Handle<Object> obj, K key, V value) {
  set_prop(obj,
    wrap_maybe_local(Nan::New(key)).ToLocalChecked(),
    wrap_maybe_local(Nan::New(value)).ToLocalChecked());

}

template<typename F>
static Local<Function> to_v8_function(F func) {
  return Nan::New<FunctionTemplate>(func)->GetFunction();
}

void init(Handle<Object> exports) {
  auto lua_version = Nan::New<Object>();

  set_prop(lua_version, "major", LUA_VERSION_MAJOR);
  set_prop(lua_version, "minor", LUA_VERSION_MINOR);
  set_prop(lua_version, "release", LUA_VERSION_RELEASE);

  set_prop(exports, "lua_version", lua_version);
  set_prop(exports, "sconce_new", to_v8_function(sconce_new));
  set_prop(exports, "sconce_init_lua_state", to_v8_function(sconce_init_lua_state));
  set_prop(exports, "sconce_define_function", to_v8_function(sconce_define_function));
  set_prop(exports, "sconce_eval", to_v8_function(sconce_eval));
}

NODE_MODULE(sconce, init)
