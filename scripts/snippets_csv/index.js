import ObjectsToCsv from 'objects-to-csv'
import fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { snippetTracking } from './runSnippetTracking.js'
import { articleTracking } from './runArticleTracking.js'

export const log = (message) => {
  // eslint-disable-next-line no-console
  console.log('=>', message);
};

const runSnippetTracking = async () => {
  // first we remove the ouput file to clear it
  if (fs.existsSync(`${__dirname}/snippetsTracking.csv`)) {
    fs.unlinkSync(`${__dirname}/snippetsTracking.csv`);
  }

  // get the data
  const data = await snippetTracking();
  log(`Found ${data.length} snippets`);

  // write the data to the output CSV file in chuncks of 500
  // this is done to prevent writing to much data which can cause issues
  // with the CSV library
  while (data.length > 0) {
    const csv = new ObjectsToCsv(data.splice(0, 500));
    csv.toDisk('./snippetsTracking.csv', { append: true });
  }
}

const runArticleTracking = async () => {
    // first we remove the ouput file to clear it
    if (fs.existsSync(`${__dirname}/articleTracking.csv`)) {
      fs.unlinkSync(`${__dirname}/articleTracking.csv`);
    }

    // get the data
    const data = await articleTracking();
    log(`Found ${data.length} snippets`);
  
    // write the data to the output CSV file in chuncks of 500
    // this is done to prevent writing to much data which can cause issues
    // with the CSV library
    while (data.length > 0) {
      const csv = new ObjectsToCsv(data.splice(0, 500));
      csv.toDisk('./articleTracking.csv', { append: true });
    }
}

const start = async () => {
  // commented out to save on runtime

  // await runSnippetTracking();
  await runArticleTracking();

  log('Done');
};

start();
