const ObjectsToCsv = require('objects-to-csv');
const {
  glob,
  globSync,
  globStream,
  globStreamSync,
  Glob,
} = require('glob')
const search = require('search-in-file');
const { gitlogPromise } = require('gitlog');
const path = require('path');
const fs = require('fs');

const repoPath = path.join(__dirname, '../../');
const directories = ['__glossary', '_cci2', '_cci2_ja', '_api'];

const log = (message) => {
  // eslint-disable-next-line no-console
  console.log('=>', message);
};

const processFile = async (file) => {
  log(`Processing ${file}`);

  // first, find last updated date and last author using git log
  const gitLogData = await gitlogPromise({
    repo: repoPath,
    file,
    number: 1,
  });

  // second, count number of snippets
  const hits = await search.fileSearch([file], '```', {
    searchResults: 'lineNo',
  });

  return {
    fileName: file.replace(repoPath, ''),
    lastAuthor: gitLogData[0].authorName,
    lastUpdatedDate: gitLogData[0].authorDate,
    snippets: hits.length ? hits[0].length / 2 : 0,
  };
};

const explore = async () => {
  let promises = [];

  const files = await glob(`${repoPath}/jekyll/@(${directories.join('|')})/*.@(md|adoc)`,{});
  log(`Found ${files.length} files`);

  files.forEach((f) => {
    promises.push(processFile(f));
  });

  return await Promise.all(promises);
};

const start = async () => {
  // first we remove the ouput file to clear it
  if (fs.existsSync(`${__dirname}/pages.csv`)) {
    fs.unlinkSync(`${__dirname}/pages.csv`);
  }

  // get the data
  const data = await explore();

  // write the data to the output CSV file in chuncks of 500
  // this is done to prevent writing to much data which can cause issues
  // with the CSV library
  while (data.length > 0) {
    const csv = new ObjectsToCsv(data.splice(0, 500));
    csv.toDisk('./pages.csv', { append: true });
  }

  log('Done');
};

start();
