#!/usr/bin/env node

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { parseCodebase } = require('../src/index'); // Adjust path to go up one level to src/
const path = require('path');

console.log('--- Route Inspector CLI ---');

yargs(hideBin(process.argv))
  .command(
    '$0 [entry]', 
    'Analyze a codebase to find all Express.js routes.', 
    (yargs) => {
      return yargs.positional('entry', {
        describe: 'The entry path to your codebase',
        default: '.'
      });
    },
    (argv) => {
      console.log(`🔍 Starting analysis of "${path.resolve(argv.entry)}"...`);

      const config = {
        entry: argv.entry,
        html: argv.html // Pass the html option if it exists
      };
      
      const routes = parseCodebase(config);

      if (!argv.html) {
        // If not generating an HTML report, print to console
        console.log(JSON.stringify(routes, null, 2));
      }

      console.log(`✨ Analysis complete. Found ${routes.length} routes.`);
    }
  )
  .option('html', {
    alias: 'o',
    type: 'string',
    description: 'Generate an HTML report at the specified path (e.g., report.html)'
  })
  .parse();