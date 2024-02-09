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

/* Total */
const addToDataTotal = async (filePath, lineStart, lineStop) => {
  // We need to be careful to not have our file names use .md or .adoc in them except as file extensions
  let pageName = (filePath.substring(filePath.lastIndexOf("/") + 1, filePath.length)).replace('.md', '').replace('.adoc', '');
  let linkToDocs = 'https://circleci.com/docs/2.0/' + pageName;

  let info = {
    pageName: pageName,
    lines: `${lineStart}-${lineStop}`,
    snippetSize: lineStop - lineStart - 1,
    linkToDocs: linkToDocs,
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
      updatesCount: logData.length,
      ageInMonths,
    };
  }

  // add a link to github at the very end
  info = {
    ...info,
    link: `https://github.com/circleci/circleci-docs/blob/master/${filePath}`,
  };

  return info;
};
/* end exploreSingle */

export const articleTracking = async () => {
  let files = await glob(
    `${repoPath}/jekyll/@(${directories.join('|')})/*.@(md|adoc)`,
  );
  log(`Found ${files.length} files`);

  // we want to filter out the ja files
  files = files.filter(function(s) {
      return s.indexOf("_cci2_ja") === -1;
  });

  const results = await search.fileSearch(files, '```', {
    searchResults: 'lineNo',
  });
  let promises = [];
  results.forEach((lines) => {
    if (lines.length) {
      // cleanup file path
      let file = lines[0].filePath.replace(repoPath, '');
      log(`${file} has ${lines.length} snippets`);

      for (let i = 0; i < lines.length; i++) {
        let hit = lines[i];
        let isSingleLineCode = (hit.line.match(/```/g) || []).length === 2;
        // Don't record snippits that are CLI/API commands and responses
        let skip = (hit.line.match(/```shell/g) || []).length === 1;

        if(!skip) {
          if (isSingleLineCode) {
            promises.push(addToDataTotal(file, hit.lineNo, hit.lineNo));
          } else {
            promises.push(addToDataTotal(file, hit.lineNo, lines[i + 1].lineNo));
            i++;
          }
        } else {
          // If you are skipping need to increment past the end of shell script ```
          i++;
        }
      }
    }
  });

  return await Promise.all(promises);
};
/* end exporeTotal */