import re
from pathlib import Path

def update_include_directive(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Update any path containing partials (with any number of ../ before) to ROOT:partial$
    content = re.sub(
        r'include::(?:\.\./)*(?:_includes/)?partials/',
        'include::ROOT:partial$',
        content
    )

    # Update any path containing snippets (with any number of ../ before) to ROOT:example$
    content = re.sub(
        r'include::(?:\.\./)*(?:_includes/)?snippets/',
        'include::ROOT:example$',
        content
    )

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"Updated {file_path}")

def process_directory(directory):
    path = Path(directory)
    for file_path in path.glob('**/*.adoc'):
        print(f"Processing {file_path}")
        update_include_directive(str(file_path))

if __name__ == '__main__':
    process_directory('docs')