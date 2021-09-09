#!/usr/bin/env bash
set -o errexit
set -o pipefail
set -o xtrace

# This file is intended to be used to launch the Jekyll container when running
# locally using docker-compose.

export JEKYLL_MINIBUNDLE_MODE="development"

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
export NVM_DIR="$HOME/.nvm"
source $NVM_DIR/nvm.sh

nvm install 14.1
npm install
npm run webpack-prod

apt-get update -y
apt-get install -y cmake pkg-config

bundle install
bundle exec jekyll clean
bundle exec jekyll serve -s jekyll --incremental --host=0.0.0.0 --trace
