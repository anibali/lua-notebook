#!/bin/bash

node-gyp rebuild && node --use-strict --expose-gc index.js
