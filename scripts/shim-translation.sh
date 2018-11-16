#!/bin/bash
# This script will copy pages that exists in English but missing in foreign languages (e.g. Japanese)
# 'Missing' in this case means the pages are not translated yet, so we want to copy from English pages.
SOURCE_DIR=$1
DEST_DIR=$2

for file in $(diff -qr $SOURCE_DIR/ $DEST_DIR | grep "Only in $SOURCE_DIR" | awk '{print $4}'); do
  cp $SOURCE_DIR/$file $DEST_DIR/$file
  sed -i -e '2s/^/untranslated: true\n/g' $DEST_DIR/$file
  sed -i -e 's|{{ site.baseurl }}/2.0/|{{ site.baseurl }}/ja/2.0/|g' $DEST_DIR/$file
done
