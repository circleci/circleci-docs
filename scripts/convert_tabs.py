#!/usr/bin/env python3
"""
convert_tabs.py

Converts custom tab syntax in a .adoc file to asciidoctor-tabs syntax (asciidoctor-tabs extension).

Usage:
    python convert_tabs.py path/to/file.adoc

- Overwrites the original file with the converted content.
- Requires every tab block's content to be surrounded by -- (AsciiDoc open block).
- Only groups consecutive tab blocks (with blank lines/comments allowed between them).
- Closes the [tabs] block immediately after the last tab.
- Outputs a + after each TabName::, then the block content (not indented).
- Does not support other tab content formats (for clarity and reliability).
"""
import sys
import re
from pathlib import Path

def is_tab_block(line):
    return re.match(r"\[\.tab(?:\.[^\]]+)*\]", line.strip())

def is_blank_or_comment(line):
    s = line.strip()
    return s == '' or s.startswith('//')

def parse_tab_block(lines, start):
    """
    Parse a tab block starting at 'start' index in lines.
    Requires content to be surrounded by --.
    Returns (tab_name, content_lines, next_index)
    """
    tab_header = lines[start].strip()
    m = re.match(r"\[\.tab(?:\.[^\]]+)*\.([A-Za-z0-9_-]+)\]", tab_header)
    if not m:
        return None, None, start
    tab_name = m.group(1)
    print(f"Found tab block: {tab_name} at line {start+1}")
    content_lines = []
    i = start + 1
    # Skip blank lines and comments after tab header
    while i < len(lines) and is_blank_or_comment(lines[i]):
        i += 1
    # Require open block --
    if i >= len(lines) or lines[i].strip() != '--':
        print(f"ERROR: Tab block '{tab_name}' at line {start+1} does not start with --")
        return None, None, i
    content_lines.append(lines[i])  # opening --
    i += 1
    while i < len(lines):
        content_lines.append(lines[i])
        if lines[i].strip() == '--':
            i += 1
            break
        i += 1
    return tab_name, content_lines, i

def process_tab_content(content_lines):
    """
    Output the tab content (already surrounded by --), not indented, with no changes.
    """
    return content_lines

def convert_tabs_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    output = []
    i = 0
    while i < len(lines):
        # Look for a tab block
        if is_tab_block(lines[i]):
            # Start collecting consecutive tab blocks (allow blank lines/comments between)
            tab_blocks = []
            j = i
            while j < len(lines):
                # Allow blank lines/comments between tab blocks
                while j < len(lines) and is_blank_or_comment(lines[j]):
                    j += 1
                if j < len(lines) and is_tab_block(lines[j]):
                    tab_name, content, next_j = parse_tab_block(lines, j)
                    if tab_name is None:
                        break
                    tab_blocks.append((tab_name, content))
                    j = next_j
                    # Peek ahead: if the next non-blank, non-comment line is not a tab block, stop grouping
                    peek = j
                    while peek < len(lines) and is_blank_or_comment(lines[peek]):
                        peek += 1
                    if peek >= len(lines) or not is_tab_block(lines[peek]):
                        print(f"Converting {len(tab_blocks)} tab blocks starting at line {i+1}")
                        output.append('[tabs]\n')
                        output.append('====\n')
                        for tab_name2, content2 in tab_blocks:
                            output.append(f'{tab_name2}::\n')
                            output.append('+\n')
                            output.extend(process_tab_content(content2))
                        output.append('====\n')
                        i = j
                        break
                else:
                    # Not a tab block, stop grouping
                    if tab_blocks:
                        print(f"Converting {len(tab_blocks)} tab blocks starting at line {i+1}")
                        output.append('[tabs]\n')
                        output.append('====\n')
                        for tab_name2, content2 in tab_blocks:
                            output.append(f'{tab_name2}::\n')
                            output.append('+\n')
                            output.extend(process_tab_content(content2))
                        output.append('====\n')
                        i = j
                    else:
                        output.extend(lines[i:j])
                        i = j
                    break
            else:
                # If we exit the while loop without breaking, handle any remaining tab blocks
                if tab_blocks:
                    print(f"Converting {len(tab_blocks)} tab blocks starting at line {i+1}")
                    output.append('[tabs]\n')
                    output.append('====\n')
                    for tab_name2, content2 in tab_blocks:
                        output.append(f'{tab_name2}::\n')
                        output.append('+\n')
                        output.extend(process_tab_content(content2))
                    output.append('====\n')
                    i = j
        else:
            output.append(lines[i])
            i += 1

    with open(filepath, 'w', encoding='utf-8') as f:
        f.writelines(output)

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Usage: python convert_tabs.py path/to/file.adoc")
        sys.exit(1)
    convert_tabs_in_file(sys.argv[1])
    print(f"Converted: {sys.argv[1]}")