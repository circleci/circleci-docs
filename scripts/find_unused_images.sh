#!/bin/bash

# Set the path to your Jekyll site's content directories
CONTENT_DIR1="./jekyll/_cci2"
CONTENT_DIR2="./jekyll/_includes"
CONTENT_DIR3="./jekyll/_cci2_ja"

# Set the path to your Jekyll site's assets directory
ASSETS_DIR="./jekyll/assets/img/docs"

# Create an array to store all image file paths
declare -a image_files

# Find all .png and .jpg files in the assets directory and store their paths in the array
while IFS= read -r -d '' file; do
    image_files+=("$file")
done < <(find "$ASSETS_DIR" -type f \( -name '*.png' -o -name '*.jpg' \) -print0)

# Create an array to store all file paths in the content directories
declare -a content_files

# Find all files in the first content directory and store their paths in the array
while IFS= read -r -d '' file; do
    content_files+=("$file")
done < <(find "$CONTENT_DIR1" -type f -print0)

# Find all files in the second content directory and store their paths in the array
while IFS= read -r -d '' file; do
    content_files+=("$file")
done < <(find "$CONTENT_DIR2" -type f -print0)

# Find all files in the third content directory and store their paths in the array
while IFS= read -r -d '' file; do
    content_files+=("$file")
done < <(find "$CONTENT_DIR3" -type f -print0)

# Loop through each image file
for image_file in "${image_files[@]}"; do
    # Set a flag to indicate if the image file is referenced
    referenced=false

    # Loop through each content file
    for content_file in "${content_files[@]}"; do
        # Check if the image file is referenced in the content file
        if grep -q "$(basename "$image_file")" "$content_file"; then
            referenced=true
            break
        fi
    done

    # If the image file is not referenced, print its path
    if ! $referenced; then
        echo "Unused image file: $image_file"
    fi
done
