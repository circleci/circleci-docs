import re
import os
import sys
import yaml
from pathlib import Path

def convert_file(file_path):
    print(f"\nProcessing {file_path}")

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Pattern to match YAML frontmatter between --- markers
    frontmatter_pattern = r'^---\n(.*?)\n---\n'
    frontmatter_match = re.search(frontmatter_pattern, content, re.DOTALL)

    platforms = []

    if frontmatter_match:
        frontmatter = frontmatter_match.group(1)
        print(f"\nFound frontmatter:\n{frontmatter}")

        # Parse YAML frontmatter
        try:
            fm_data = yaml.safe_load(frontmatter)
        except Exception as e:
            print(f"YAML parse error in {file_path}: {e}")
            fm_data = {}

        # Extract platform tags from contentTags
        if 'contentTags' in fm_data and 'platform' in fm_data['contentTags']:
            platforms = fm_data['contentTags']['platform']
        # Remove the old frontmatter entirely
        content = re.sub(frontmatter_pattern, '', content, flags=re.DOTALL)
    else:
        print(f"No frontmatter found in {file_path}")

    # If we found platforms, add them as an attribute after the first heading
    if platforms:
        platform_attr = f":page-platform: {', '.join(platforms)}"
        print(f"\nAdding platform attribute:\n{platform_attr}")
        # Find the first heading and insert the platform attribute after it
        heading_pattern = r'^(=+\s+.*?\n)'
        if re.search(heading_pattern, content, re.MULTILINE):
            content = re.sub(heading_pattern, r'\1' + platform_attr + '\n', content, count=1, flags=re.MULTILINE)
            print("Added platform attribute after first heading")
        else:
            # If no heading found, add at the top of the file
            content = platform_attr + '\n' + content
            print("No heading found, added platform attribute at top of file")

    # Write the modified content back to the file
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content.strip() + '\n')

    print(f"Successfully processed {file_path}")

def process_directory(directory):
    path = Path(directory)
    for file_path in path.glob('**/*.adoc'):
        convert_file(str(file_path))

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Please provide a directory path")
        sys.exit(1)

    directory = sys.argv[1]
    if not os.path.isdir(directory):
        print(f"Directory {directory} does not exist")
        sys.exit(1)

    process_directory(directory)