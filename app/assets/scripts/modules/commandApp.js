#!/usr/bin/env node
// up comment => to mae index.js to run like an exe file

// "bin": {
//     "nls": "index.js"
//   },
//   "dependencies": {
//     "chalk": "^2.4.2"
//   }

// chmod +x index.js => command to give permission to run file
// npm link : to make proejct available everywhere in every directory

const fs = require('fs');
const util = require('util');
const chalk = require('chalk');
const path = require('path');

// Method #2
// const lstat = util.promisify(fs.lstat);

// Method #3
const { lstat } = fs.promises;

const targetDir = process.argv[2] || process.cwd();

// readdir  : read directory
fs.readdir(targetDir, async (err, filenames) => {
  if (err) {
    console.log(err);
  }

  const statPromises = filenames.map((filename) => {
    return lstat(path.join(targetDir, filename));
  });

  const allStats = await Promise.all(statPromises);

  for (let stats of allStats) {
    const index = allStats.indexOf(stats);

    if (stats.isFile()) {
      console.log(filenames[index]);
    } else {
      console.log(chalk.bold(filenames[index]));
    }
  }
});

// Method #1
// const lstat = filename => {
//   return new Promise((resolve, reject) => {
//     fs.lstat(filename, (err, stats) => {
//       if (err) {
//         reject(err);
//       }

//       resolve(stats);
//     });
//   });
// };