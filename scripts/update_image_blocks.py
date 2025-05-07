#!/usr/bin/env python3

import os
import re
from pathlib import Path

def find_adoc_files(root_dir):
    """Find all .adoc files in the given directory and its subdirectories."""
    return list(Path(root_dir).rglob("*.adoc"))

def update_image_blocks(content, file_path):
    """Update image blocks in the content to use Antora resource IDs."""
    # Regular expression to match image blocks with double colon
    # This matches both single-line and multi-line image blocks
    image_pattern = r'image::([^[]+)\[(.*?)\]'

    def replace_image(match):
        image_path = match.group(1)
        attributes = match.group(2)

        # Remove any leading/trailing whitespace and slashes
        image_path = image_path.strip().strip('/')

        # If the image path is already an Antora resource ID starting with xref:, skip it
        if image_path.startswith('xref:'):
            return match.group(0)

        # Extract just the image path, removing any prefixes and cleaning up slashes
        if image_path.startswith('guides:ROOT:images/'):
            image_path = image_path[18:]  # Remove 'guides:ROOT:images/' prefix
        elif image_path.startswith('guides:ROOT:/'):
            image_path = image_path[13:]  # Remove 'guides:ROOT:/' prefix
        elif image_path.startswith('guides:ROOT:'):
            image_path = image_path[12:]  # Remove 'guides:ROOT:' prefix
        elif image_path.startswith('images/'):
            image_path = image_path[7:]  # Remove 'images/' prefix

        # Clean up any remaining leading/trailing slashes
        image_path = image_path.strip('/')

        # Convert the image path to an Antora resource ID
        # Using image:: for block images as per Antora docs
        # Note: We don't include 'images/' as Antora automatically applies the image$ family coordinate
        antora_path = f'image::guides:ROOT:{image_path}[{attributes}]'
        return antora_path

    # Process all image:: blocks
    updated_content = re.sub(image_pattern, replace_image, content)
    return updated_content

def process_file(file_path):
    """Process a single AsciiDoc file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        updated_content = update_image_blocks(content, file_path)

        # Only write to the file if changes were made
        if content != updated_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(updated_content)
            print(f"Updated image blocks in: {file_path}")
    except Exception as e:
        print(f"Error processing {file_path}: {str(e)}")

def main():
    # Get the root directory (docs folder)
    root_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'docs')

    # Find all AsciiDoc files
    adoc_files = find_adoc_files(root_dir)

    # Process each file
    for file_path in adoc_files:
        process_file(file_path)

    print(f"Processed {len(adoc_files)} files")

if __name__ == '__main__':
    main()