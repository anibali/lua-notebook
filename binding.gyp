{
  "targets": [
    {
      "target_name": "sconce",
      "variables": {
        "lua_include": "<!(find /usr/include /usr/local/include $NODELUA_INCLUDE -name lua.h | sed s/lua.h//)"
      },
      "sources": [
        "src/sconce.cc"
      ],
      "include_dirs": [
        "<@(lua_include)",
        "<!(node -e \"require('nan')\")"
      ],
      "libraries": [
        "<!(pkg-config --libs-only-l --silence-errors lua || pkg-config --libs-only-l --silence-errors lua5.2 || echo '')",
        "-ldl"
      ]
    }
  ]
}
