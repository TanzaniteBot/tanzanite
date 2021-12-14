#!/bin/zsh
source $NVM_DIR/nvm.sh 
nvm install 17.2.0 > /dev/null 2>&1
~/.nvm/versions/node/v17.2.0/bin/node --experimental-json-modules --no-warnings  dist/src/bot.js