#!/bin/bash

# Ensure the destination directory exists

output_file="./extensions/last-update.json"

# Delete the output file if it already exists
if [ -f "$output_file" ]; then
  rm "$output_file"
fi

echo "{" > "$output_file"
first=true

# Only process files matching the new structure
for file in $(git ls-files | grep -E '^docs/[^/]+/modules/[^/]+/pages/.*\.adoc$'); do
  echo "Processing file: $file"
  # Get the last commit date for the file
  last_commit_date=$(git log -1 --format="%cd" --date=iso "$file")
  echo "Last commit date: $last_commit_date"
  
  # Extract the component and module from the file path
  # Example path: docs/<component>/modules/<module>/pages/...
  component=$(echo "$file" | sed -En 's|^docs/([^/]+)/modules/.*|\1|p')
  echo "Component: $component"
  module=$(echo "$file" | sed -En 's|^docs/[^/]+/modules/([^/]+)/.*|\1|p')
  echo "Module: $module"
  # Create a JSON entry for the file using the structure component/module/filename
  if [ "$first" = true ]; then
    first=false
  else
    echo "," >> "$output_file"
  fi
  
  echo "\"$component/$module/$(basename "$file")\": \"$last_commit_date\"" >> "$output_file"
done

echo "}" >> "$output_file"
echo "$output_file file created with last commit dates for all matching .adoc files."