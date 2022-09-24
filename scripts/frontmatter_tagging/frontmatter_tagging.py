#!/usr/bin/env python3

# This script iterates over our docs and converts version front matter to tags format
# sectionTags are not dealt with in this script
import os
import glob
import sys
from pathlib import Path
import re

## Select desired markdown and adoc files
docs_paths = (
  '../../jekyll/_cci2/*.md',
  '../../jekyll/_cci2/*.adoc',
  '../../jekyll/_cci2_ja/*.md',
  '../../jekyll/_cci2_ja/*.adoc',
)

def iterate_docs():
    # make temp directory to pull new data from
    if not os.path.exists('tmp'):
      os.mkdir('tmp')

    files = []
    # iterate over selected folders
    for path in docs_paths:
        files.extend(glob.glob(path))

    for file in files:
      path = Path(file)
      if not os.path.exists('tmp/' + str(path.parent.name)): ## Test case file directory could expand e.g _cci2_ko
        os.mkdir('tmp/' + str(path.parent.name))

      # location to store new versions of each file
      tmpPath = 'tmp/' + str(path.parent.name) + '/'+ str(Path(path).stem) + str(Path(path).suffix)
    
      f = open(file, "r")

      content = f.read()

      matchFrontmatter = re.search(r'^---[\s\S]+?---', content)

      if matchFrontmatter:
        if matchFrontmatter[0].find("version:") != -1:
          matchVersion = re.search( r'version:[\s\S]+?---', content)[0]
          if matchFrontmatter[0].find("suggested:") != -1:
            matchVersion = re.search( r'version:[\s\S]+?suggested:', content)[0]
          temp = open(tmpPath, "w")
          removeFirstnLast = matchVersion.replace('\n', '\n' + "  ")
          indentedChildren = removeFirstnLast[removeFirstnLast.find('\n')+1:removeFirstnLast.rfind('\n')]
          newContent = content.replace(matchVersion[matchVersion.find('\n')+1:matchVersion.rfind('\n')], indentedChildren)
          newFrontmatter = re.search( r'^---[\s\S]+?---', newContent)[0]
          contentTagsFrontmatter = newFrontmatter.replace('version:','contentTags: \n  platform:')
          replacedoriginal = newContent.replace(newFrontmatter, contentTagsFrontmatter)
          temp.write(replacedoriginal)

iterate_docs()
