#!/usr/bin/env node

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { cosmiconfig } = require('cosmiconfig');
// FIX: Corrected the path to go up one level from 'bin' to 'src'
const { parseCodebase } = require('../src/index');
const { generateOpenApiSpec } = require('../src/openapi-generator');
const path = require('path');
const fs = require('fs');

const explorer = cosmiconfig('inspector');

console.log('--- Route Inspector CLI ---');

yargs(hideBin(process.argv))
  .command(
    '$0 [entry]',
    'Analyze a codebase to find all routes for a given framework.',
    (yargs) => {
      return yargs.positional('entry', {
        describe: 'The entry path to your codebase',
      });
    },
    async (argv) => {
      try {
        const result = await explorer.search();
        const configFileOptions = result ? result.config : {};

        const config = {
          entry: argv.entry || configFileOptions.entry || '.',
          html: argv.html || configFileOptions.html,
          openapi: argv.openapi || configFileOptions.openapi,
          ignore: argv.ignore || configFileOptions.ignore,
          framework: argv.framework || configFileOptions.framework || 'express',
        };

        console.log(`🔍 Starting analysis of "${path.resolve(config.entry)}" using the "${config.framework}" parser...`);
        
        const routes = parseCodebase(config);
        console.log(`[DEBUG] The CLI received ${routes.length} routes.`);

        if (config.openapi) {
          const spec = generateOpenApiSpec(routes);
          fs.writeFileSync(config.openapi, JSON.stringify(spec, null, 2));
          console.log(`✅ OpenAPI spec generated at: ${config.openapi}`);

        } else if (config.html) {
          console.log(`Check for HTML report at: ${config.html}`);

        } else {
          console.log(JSON.stringify(routes, null, 2));
        }

        console.log(`✨ Analysis complete. Found ${routes.length} routes.`);
      } catch (error) {
        console.error(`An error occurred: ${error.message}`);
      }
    }
  )
  .option('framework', {
    type: 'string',
    description: 'The framework to analyze (express, koa, or fastify)',
    default: 'express'
  })
  .option('html', {
    alias: 'o',
    type: 'string',
    description: 'Generate an HTML report at the specified path'
  })
  .option('openapi', {
    type: 'string',
    description: 'Generate an OpenAPI v3 spec file at the specified path'
  })
  .option('ignore', {
    type: 'array',
    description: 'A list of glob patterns to ignore'
  })
  .parse();