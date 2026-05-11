#!/bin/bash

set -e

SRC_DIR="old-docs"
DEST_ROOT="docs"

find "$SRC_DIR" -type f -name '*.adoc' | while read -r file; do
  # Extract component and module from frontmatter
  component=$(awk '/^component:/ {print $2; exit}' "$file")
  module=$(awk '/^module:/ {print $2; exit}' "$file")
  filename=$(basename "$file")

  if [[ -n "$component" && -n "$module" ]]; then
    dest_dir="$DEST_ROOT/$component/modules/$module/pages"
    mkdir -p "$dest_dir"
    dest_file="$dest_dir/$filename"
    if [[ -e "$dest_file" ]]; then
      echo "SKIP: $dest_file already exists"
    else
      cp "$file" "$dest_file"
      echo "MIGRATED: $file -> $dest_file"
    fi
  else
    echo "SKIP: $file (missing component or module in frontmatter)"
  fi
done