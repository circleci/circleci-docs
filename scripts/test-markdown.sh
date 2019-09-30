#!/usr/bin/env bash

# this script runs the "md proofer tool" on the documentation to make sure our markdown is clean and ready to be converted to HTML.


wget https://github.com/felicianotech/md-proofer/releases/download/v0.1.0/md-proofer-v0.1.0-linux-amd64.tar.gz
tar xfz md-proofer-v*.tar.gz
sudo chmod +x ./md-proofer

echo "Test CircleCI 2.0 Markdown files"
echo "===================================================================================="
./md-proofer lint jekyll/_cci2/
echo "\n\nTest CircleCI API Markdown files"
echo "===================================================================================="
./md-proofer lint jekyll/_api/
echo "\n\nTest CircleCI 1.0 Markdown files"
echo "===================================================================================="
./md-proofer lint jekyll/_cci1/
