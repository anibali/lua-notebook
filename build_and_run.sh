#!/bin/bash -e

node-gyp rebuild
nodemon -L -x "node --use-strict --nolazy" -e .js -w src src/server.js
