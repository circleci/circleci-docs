#!/bin/bash

set -e

temp_dir=$(mktemp -d)
file_name="ja.zip"
api_key=${CROWDIN_API_KEY}

# TODO
# Why ?branch=master doesn't work?
curl "https://api.crowdin.com/api/project/circleci-jp/download/ja.zip?key=${api_key}" -o $temp_dir/$file_name

echo "Downloaded to ${temp_dir}/${file_name}"

pushd $temp_dir
echo $(pwd)
unzip $file_name
popd


target_relative_path="../jekyll/_cci2_ja/"
source_relative_path="master/jekyll/_cci2/ja/"

cp $temp_dir/$source_relative_path/* $target_relative_path/
