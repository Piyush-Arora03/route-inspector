#!/usr/bin/env node

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { cosmiconfig } = require('cosmiconfig');
const { parseCodebase } = require('../src/index');
const path = require('path');

const explorer = cosmiconfig('inspector');

console.log('--- Route Inspector CLI ---');

yargs(hideBin(process.argv))
  .command(
    '$0 [entry]', 
    'Analyze a codebase to find all Express.js routes.', 
    (yargs) => {
      return yargs.positional('entry', {
        describe: 'The entry path to your codebase',
      });
    },
    async (argv) => {
      try {
        const result = await explorer.search();
        const configFileOptions = result ? result.config : {};

        // Merge config file options with command-line arguments.
        // Command-line arguments take precedence.
        const config = {
          entry: argv.entry || configFileOptions.entry || '.',
          html: argv.html || configFileOptions.html,
          ignore: argv.ignore || configFileOptions.ignore,
          // *** THE FIX IS HERE: Use the framework from the CLI or config file ***
          framework: argv.framework || configFileOptions.framework || 'express',
        };

        console.log(`🔍 Starting analysis of "${path.resolve(config.entry)}" using the "${config.framework}" parser...`);
        
        const routes = parseCodebase(config);

        if (!config.html) {
          console.log(JSON.stringify(routes, null, 2));
        }

        console.log(`✨ Analysis complete. Found ${routes.length} routes.`);
      } catch (error) {
        console.error(`An error occurred: ${error.message}`);
      }
    }
  )
  // *** ADDED A NEW OPTION FOR FRAMEWORK ***
  .option('framework', {
    type: 'string',
    description: 'The framework to analyze (express, koa, or fastify)',
    default: 'express' // Default to express if not specified
  })
  .option('html', {
    alias: 'o',
    type: 'string',
    description: 'Generate an HTML report at the specified path'
  })
  .option('ignore', {
    type: 'array',
    description: 'A list of glob patterns to ignore'
  })
  .parse();