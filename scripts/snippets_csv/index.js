const ObjectsToCsv = require('objects-to-csv');
const fs = require('fs');

const path = require('path');
const glob = require('glob-promise');
const search = require('search-in-file');
const { gitlogPromise } = require('gitlog');

const repoPath = path.join(__dirname, '../../');
const directories = ['__glossary', '_cci2', '_cci2_ja'];

const log = (message) => {
  // eslint-disable-next-line no-console
  console.log('=>', message);
};


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
  
const exploreSingle = async () => {
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

/* Total */
const addToDataTotal = async (filePath, lineStart, lineStop, numSnippets) => {
  let pageName = (filePath.substring(filePath.lastIndexOf("/") + 1, filePath.length - 1)).split('.')[0];
  let info = {
    pageName: pageName,
    numSnippets: numSnippets,
    linkToDocs: 'https://circleci.com/docs/2.0/' + pageName,
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
      linkToDocs: 'https://circleci.com/docs/2.0/'
    };
  }

  // add a link to github at the very end
  info = {
    ...info,
    link: `https://github.com/circleci/circleci-docs/blob/master/${filePath}?plain=1#L${lineStart}-L${lineStop}`,
  };

  return info;
};
/* end exploreSingle */

const exploreTotal = async () => {
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
      let file = lines[0].filePath.replace(repoPath, '');
      log(`${file} has ${lines.length} snippets`);

      // have to count how many snippits need remove to know how many you have
      let numberOfValidSnippits = 0;
      for (let i = 0; i < lines.length; i++) {
        let hit = lines[i];
        let skip = (hit.line.match(/```shell/g) || []).length === 1;
        if(!skip) {
          numberOfValidSnippits++;
        } else {
          i++;
        }
      }

      for (let i = 0; i < lines.length; i++) {
        let hit = lines[i];
        let isSingleLineCode = (hit.line.match(/```/g) || []).length === 2;
        // Don't record snippits that are CLI/API commands and responses
        let skip = (hit.line.match(/```shell/g) || []).length === 1;
        
        if(!skip) {
          if (isSingleLineCode) {
            promises.push(addToDataTotal(file, hit.lineNo, hit.lineNo, numberOfValidSnippits));
          } else {
            promises.push(addToDataTotal(file, hit.lineNo, lines[i + 1].lineNo, numberOfValidSnippits));
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
const runSingleSnippetInfo = async () => {
  // first we remove the ouput file to clear it
  if (fs.existsSync(`${__dirname}/snippets.csv`)) {
    fs.unlinkSync(`${__dirname}/snippets.csv`);
  }

  // get the data
  const data = await exploreSingle();
  log(`Found ${data.length} snippets`);

  // write the data to the output CSV file in chuncks of 500
  // this is done to prevent writing to much data which can cause issues
  // with the CSV library
  while (data.length > 0) {
    const csv = new ObjectsToCsv(data.splice(0, 500));
    csv.toDisk('./snippets.csv', { append: true });
  }
}

const runTotalSnippetInfo = async () => {
    // first we remove the ouput file to clear it
    if (fs.existsSync(`${__dirname}/snippetsTotal.csv`)) {
      fs.unlinkSync(`${__dirname}/snippetsTotal.csv`);
    }

    // get the data
    const data = await exploreTotal();
    log(`Found ${data.length} snippets`);
  
    // write the data to the output CSV file in chuncks of 500
    // this is done to prevent writing to much data which can cause issues
    // with the CSV library
    while (data.length > 0) {
      const csv = new ObjectsToCsv(data.splice(0, 500));
      csv.toDisk('./snippetsTotal.csv', { append: true });
    }
}

const start = async () => {
  // commented out to save on runtime
  // await runSingleSnippetInfo();
  await runTotalSnippetInfo();

  log('Done');
};

start();
