import * as path from 'path'
import glob from 'glob-promise'
import * as search from 'search-in-file'
import { gitlogPromise } from 'gitlog'
import { log } from './index.js'

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoPath = path.join(__dirname, '../../');
const directories = ['__glossary', '_cci2', '_cci2_ja'];


/* Single */
const addToData = async (filePath, lineStart, lineStop) => {
  let info = {
    file: filePath,
    lines: `${lineStart}-${lineStop}`,
    snippetSize: lineStop - lineStart - 1,
  };

  const logData = await gitlogPromise({
    repo: repoPath,
    fileLineRange: {
      file: filePath,
      startLine: lineStart,
      endLine: lineStop,
    },
    number: 100,
  }).then();

  if (logData.length) {
    const creationDate = logData[logData.length - 1].authorDate.split(' ')[0];

    // calculate the age of the snippet
    const today = new Date();
    const snippetDate = new Date(creationDate);
    const ageInMonths =
      today.getFullYear() * 12 +
      today.getMonth() -
      (snippetDate.getFullYear() * 12 + snippetDate.getMonth());

    info = {
      ...info,
      creationDate,
      createdBy: logData[logData.length - 1].authorName,
      lastUpdatedDate: logData[0].authorDate.split(' ')[0],
      lastUpdatedBy: logData[0].authorName,
      updatesCount: logData.length,
      ageInMonths,
    };
  }

  // add a link to github at the very end
  info = {
    ...info,
    link: `https://github.com/circleci/circleci-docs/blob/master/${filePath}?plain=1#L${lineStart}-L${lineStop}`,
  };

  return info;
};

export const snippetTracking = async () => {
  console.log('exploreSingle')
  const files = await glob(
    `${repoPath}/jekyll/@(${directories.join('|')})/*.@(md|adoc)`,
  );
  log(`Found ${files.length} files`);

  const results = await search.fileSearch(files, '```', {
    searchResults: 'lineNo',
  });
  let promises = [];

  results.forEach((lines) => {
    if (lines.length) {
      // cleanup file path
      const file = lines[0].filePath.replace(repoPath, '');
      log(`${file} has ${lines.length} snippets`);

      for (let i = 0; i < lines.length; i++) {
        const hit = lines[i];
        const isSingleLineCode = (hit.line.match(/```/g) || []).length === 2;

        if (isSingleLineCode) {
          promises.push(addToData(file, hit.lineNo, hit.lineNo));
        } else {
          promises.push(addToData(file, hit.lineNo, lines[i + 1].lineNo));
          i++;
        }
      }
    }
  });

  return await Promise.all(promises);
};