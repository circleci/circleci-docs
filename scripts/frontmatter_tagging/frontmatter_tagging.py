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
          if matchFrontmatter[0].find("suggested:") != -1: # check if sugested exists, suggested is below version which changes when version tags end
            matchVersion = re.search( r'version:[\s\S]+?suggested:', content)[0]
          temp = open(tmpPath, "w") # open new file to write to instead of overriding existing, design choice
          removeFirstnLast = matchVersion.replace('\n', '\n' + "  ") # extract only children of version
          indentedChildren = removeFirstnLast[removeFirstnLast.find('\n')+1:removeFirstnLast.rfind('\n')] # indent the children of version
          newContent = content.replace(matchVersion[matchVersion.find('\n')+1:matchVersion.rfind('\n')], indentedChildren) # replace version children with indented children
          newFrontmatter = re.search( r'^---[\s\S]+?---', newContent)[0] # replace new version inside of content with indented children
          contentTagsFrontmatter = newFrontmatter.replace('version:','contentTags: \n  platform:') # replace word version with contentTags and append platform under contentTags
          replacedoriginal = newContent.replace(newFrontmatter, contentTagsFrontmatter) # override old front matter with finished new frontmatter
          temp.write(replacedoriginal) # write to new file

iterate_docs()
