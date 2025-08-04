const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { parseFile } = require('./parser');
const { generateHtmlReport } = require('./report-generator');

function parseCodebase(config = {}) {
  const {
    entry = '.',
    framework = 'express',
    ignore = ['**/node_modules/**'],
    html,
  } = config;
  const files = glob.sync(`${entry}/**/*.@(js|ts|jsx|tsx)`, {
    absolute: true,
    ignore: ignore
  });

  const routes = [];
  const appRouters = new Map();

  files.forEach(file => {
    try {
      const fileRoutes = parseFile(file, framework, appRouters);
      routes.push(...fileRoutes);
    } catch (error) {
      console.error(`Could not parse ${file}: ${error.message}`);
    }
  });

  if (html && typeof html === 'string') {
    generateHtmlReport(routes, html);
  }

  return routes;
}

module.exports = {
  parseCodebase
};