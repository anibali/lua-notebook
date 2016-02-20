#include <nan.h>

#include <string.h>

using namespace v8;

extern "C" {
  #include <lua.h>
  #include <lauxlib.h>
  #include <lualib.h>
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
} Sconce_State;

void destroy_sconce_state(char *data, void *hint) {
  Sconce_State* ss = (Sconce_State*)data;

  // Close Lua state if present
  if(ss->L) {
    lua_close(ss->L);
    ss->L = NULL;
  }

  free(data);

  printf("DESTROYED\n");
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

int call_js_function(lua_State *L) {
  int n_args = lua_gettop(L);
  printf("n_args = %d\n", n_args);

  // Get JS function from upvalue
  Nan::Callback* callback = (Nan::Callback*)lua_touserdata(L, lua_upvalueindex(1));

  Local<Value> argv[n_args];

  for(int i = 1; i <= n_args; ++i) {
    switch(lua_type(L, i)) {
      case LUA_TNIL: {
        argv[i - 1] = Nan::Undefined();
        break;
      };

      case LUA_TNUMBER: {
        argv[i - 1] = Nan::New(lua_tonumber(L, i));
      } break;

      case LUA_TBOOLEAN: {
        argv[i - 1] = Nan::New(lua_toboolean(L, i) ? true : false);
      } break;

      case LUA_TSTRING: {
        argv[i - 1] = Nan::New(lua_tostring(L, i)).ToLocalChecked();
      } break;

      default: {
        return luaL_error(L, "[SCONCE] Unsupported arg type");
      }
    }
  }

  Local<Value> result = callback->Call(n_args, argv);

  if(result->IsUndefined() || result->IsNull()) {
    lua_pushnil(L);
  } else if(result->IsNumber()) {
    lua_pushnumber(L, result->NumberValue());
  } else if(result->IsBoolean()) {
    lua_pushboolean(L, result->BooleanValue() ? 1 : 0);
  } else if(result->IsString()) {
    Nan::Utf8String string_result(result);
    lua_pushstring(L, *string_result);
  } else {
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
  // TODO: Store this pointer in ss and later delete with "delete callback;"

  lua_pushlightuserdata(ss->L, callback);
  lua_pushcclosure(ss->L, call_js_function, 1);
  lua_setglobal(ss->L, *function_name);
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

  luaL_dostring(ss->L, *code);
}

void init(Handle<Object> exports) {
  exports->Set(Nan::New("LUA_VERSION_MAJOR").ToLocalChecked(),
    Nan::New(LUA_VERSION_MAJOR).ToLocalChecked());

  exports->Set(Nan::New("LUA_VERSION_MINOR").ToLocalChecked(),
    Nan::New(LUA_VERSION_MINOR).ToLocalChecked());

  exports->Set(Nan::New("LUA_VERSION_RELEASE").ToLocalChecked(),
    Nan::New(LUA_VERSION_RELEASE).ToLocalChecked());

  exports->Set(Nan::New("sconce_new").ToLocalChecked(),
               Nan::New<FunctionTemplate>(sconce_new)->GetFunction());

  exports->Set(Nan::New("sconce_init_lua_state").ToLocalChecked(),
               Nan::New<FunctionTemplate>(sconce_init_lua_state)->GetFunction());

  exports->Set(Nan::New("sconce_define_function").ToLocalChecked(),
               Nan::New<FunctionTemplate>(sconce_define_function)->GetFunction());

  exports->Set(Nan::New("sconce_eval").ToLocalChecked(),
               Nan::New<FunctionTemplate>(sconce_eval)->GetFunction());
}

NODE_MODULE(sconce, init)
