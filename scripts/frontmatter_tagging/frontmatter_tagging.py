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

      if matchFrontmatter: # check if front matter exists, if no front matter do nothing
        if matchFrontmatter[0].find("version:") != -1: # check if version tags exist, if no version tags do nothing
          matchVersion = re.search( r'version:[\s\S]+?---', content)[0]
          removeFirstnLast = matchVersion[matchVersion.find('\n')+1:matchVersion.rfind('\n')] # remove version: and --- from group
          lines = '' # stores group of children
          if removeFirstnLast.find(":") != -1: # check if any other meta data after version
            for line in removeFirstnLast.splitlines(): # grab only the children after version
              if line[0] == '-' or line[0] == ' ':     # (---) been removed do not have to worry about it as edge case
                lines += line + '\n'
              else:
                break
          temp = open(tmpPath, "w") # open new file to write to instead of overriding existing, design choice 
          children = lines[: lines.rfind('\n')]  if lines[: lines.rfind('\n')] else matchVersion[matchVersion.find('\n')+1:matchVersion.rfind('\n')] # remove extra new lines
          paddChild = '  ' + children.replace('\n', '\n' + "  ") # indents the children
          replacedoriginal = content.replace(children, paddChild) # replace not indented children with indented
          contentTagsFrontmatter = replacedoriginal.replace('version:','contentTags: \n  platform:') # turn version into platform
          temp.write(contentTagsFrontmatter) # write to new file

# Create tmp folders
# iterate and read over desired files
# extract frontmatter
# no front matter do nothing
# check frontmatter for version tags
# extra children
# indent children
# insert indented children
# write to new file
iterate_docs()
