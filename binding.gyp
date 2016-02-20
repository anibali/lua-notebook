{
  "targets": [
    {
      "target_name": "lua-node",
      "variables": {
        "lua_include": "<!(find /usr/include /usr/local/include -name lua.h | sed s/lua.h//)"
      },
      "sources": [
        "ext/lua-node.cc"
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
