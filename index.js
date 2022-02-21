// import native node modules
import path from 'path';
import os from'os';
import fs from 'fs';

// import third party modules
import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify/sync';
import _ from 'lodash';

// polyfill dirname and filename vars
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

// filenames from cli args
let sourcePath;
let source = process.argv[2];
let target = process.argv[3];

// get os downloads folder
const homeDir = os.homedir();

if(!source) {
  console.error('Please supply a source file path');
  process.exit(1);
}

// TODO - enable source to come from any directory, or if not supplied, use downloads folder
sourcePath = path.join(homeDir, 'Downloads', source);

if(!target) {
  console.log('No Target Supplied. Using default. If desired filename, enter a target file path i.e. `npm start ./source-file.csv ./target-file.csv`');
  const date = new Date();
  const currDate = new Intl.DateTimeFormat("ko-KR", {month:'2-digit',day:'2-digit', year:'numeric'}).format(date);
  const dateAppend = currDate.split('. ').join('_').split('.')[0];
  
  target = path.join(homeDir, 'Downloads', 'processed_' + dateAppend + source);
}

console.log('source filename: ', source);
console.log('source full path: ', sourcePath);
console.log('target: ', target);

// parsing and writing functions
const processor = async (err, records) => {

  const columnsToKeep = ['Project', 'Description', 'Start Date', 'Billable Rate (USD)', 'Duration (h)', 'Duration (decimal)'];
  const selectedCols = records.map(record => _.pick(record, columnsToKeep));
  const sorted = selectedCols.sort((a, b) => a < b ? 1 : -1);
  
  const newCSV = stringify(sorted, {
    header: true
  });

  await fs.writeFile(target, newCSV, (err) => {
    if(err) {
      console.error(err)
    } else {
      console.log('Success!');
    }
  });
}

const parser = parse(
  {
    columns: true
  }, 
  processor
);

fs.createReadStream(sourcePath, 'utf8').pipe(parser);
