#!/bin/bash

node-gyp rebuild && node --use-strict --expose-gc src/sconce.js
