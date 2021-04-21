#!/bin/bash

set -e

temp_dir=$(mktemp -d)
file_name="ja.zip"
api_key=${CROWDIN_API_KEY}

# TODO
# Why ?branch=master doesn't work?
curl "https://api.crowdin.com/api/project/circleci-jp/download/ja.zip?login=teka23&account-key=${api_key}" -o $temp_dir/$file_name

echo "Downloaded to ${temp_dir}/${file_name}"

pushd $temp_dir
echo $(pwd)
unzip $file_name
popd

target_relative_path="../jekyll/_cci2_ja/"
source_relative_path="master/jekyll/_cci2/ja/"

cp $temp_dir/$source_relative_path/* $target_relative_path/

# Fixing broken TOC
# Crowding sometimes squashes new line preceeded by {:toc}
#
# Bad:
# - 目次 {:toc}
#
# Good:
# - 目時
# {:toc}
function fix_broken_toc () {
    perl -p -i -e 's/(^.+)({:toc})/\1\n\2/' $target_relative_path/*
}

# Fixing broken no TOC
# Crowding sometimes squashes new line followed by {:.no_toc}
#
# Bad:
# {:.no_toc} キャッシュ サイズは...
#
# Good:
# {:.no_toc}
# キャッシュ サイズは...
function fix_broken_no_toc () {
    perl -p -i -e 's/\{:.no_toc\}(.+)/{:.no_toc}\n\1/' $target_relative_path/*
}

# Fixing broken table with table-striped
# Crowding sometimes squashes new line followed by {: class="table table-striped"}
#
# Bad:
# | Nomad クライアント | 80、443 | API アクセス | {: class="table table-striped"}
#
# Good:
# | Nomad クライアント | 80、443 | API アクセス |
# {: class="table table-striped"}
#
function fix_bad_table-striped_tag () {
    perl -p -i -e 's/(.+){: class=\"table table-striped\"}/\1\n{: class=\"table table-striped\"}/' $target_relative_path/*
}

fix_broken_toc
fix_broken_no_toc
fix_bad_table-striped_tag
