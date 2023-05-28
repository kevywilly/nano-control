#!/bin/bash
yarn build && git add -A . && git commit -a -m 'build' && git push
