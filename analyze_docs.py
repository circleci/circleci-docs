#!/usr/bin/env python3
"""
Analyze .adoc files in the docs directory and generate a character count report.
"""

import os
import csv
import re
from pathlib import Path

def count_characters(file_path):
    """Count characters in a file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            return len(content)
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return 0

def has_page_description(file_path):
    """Check if file has a page-description attribute."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            # Read first 50 lines (page attributes are typically at the top)
            for _ in range(50):
                line = f.readline()
                if not line:
                    break
                # Check for :page-description: attribute
                if re.match(r'^\s*:page-description:\s*.+', line):
                    return True
        return False
    except Exception as e:
        print(f"Error checking page-description in {file_path}: {e}")
        return False

def main():
    docs_dir = Path('/workspace/docs')
    adoc_files = list(docs_dir.glob('**/*.adoc'))
    
    print(f"Found {len(adoc_files)} .adoc files")
    
    results = []
    
    for adoc_file in adoc_files:
        char_count = count_characters(adoc_file)
        has_description = has_page_description(adoc_file)
        relative_path = adoc_file.relative_to('/workspace')
        filename = adoc_file.name
        
        flagged_size = "YES" if char_count > 50000 else "NO"
        missing_description = "YES" if not has_description else "NO"
        
        results.append({
            'filename': filename,
            'path': str(relative_path),
            'character_count': char_count,
            'flagged_over_50k': flagged_size,
            'missing_page_description': missing_description
        })
    
    # Sort by character count descending
    results.sort(key=lambda x: x['character_count'], reverse=True)
    
    # Write to CSV
    output_file = '/workspace/docs_character_audit.csv'
    with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['filename', 'path', 'character_count', 'flagged_over_50k', 'missing_page_description']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        
        writer.writeheader()
        for row in results:
            writer.writerow(row)
    
    print(f"\nReport generated: {output_file}")
    
    # Print summary statistics
    total_files = len(results)
    flagged_count = sum(1 for r in results if r['flagged_over_50k'] == 'YES')
    missing_desc_count = sum(1 for r in results if r['missing_page_description'] == 'YES')
    both_issues_count = sum(1 for r in results if r['flagged_over_50k'] == 'YES' and r['missing_page_description'] == 'YES')
    total_chars = sum(r['character_count'] for r in results)
    
    print(f"\n=== SUMMARY ===")
    print(f"Total files analyzed: {total_files}")
    print(f"Total characters: {total_chars:,}")
    print(f"Files over 50,000 characters: {flagged_count}")
    print(f"Files missing page-description: {missing_desc_count}")
    print(f"Files with both issues: {both_issues_count}")
    print(f"Average characters per file: {total_chars // total_files:,}")
    
    if flagged_count > 0:
        print(f"\n=== TOP 10 LARGEST FILES ===")
        for i, result in enumerate(results[:10], 1):
            desc_status = " [NO DESCRIPTION]" if result['missing_page_description'] == 'YES' else ""
            print(f"{i}. {result['filename']}: {result['character_count']:,} chars{desc_status}")

if __name__ == '__main__':
    main()
