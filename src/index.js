const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { parseFile } = require('./parser');

function parseCodebase(config = {}) {
  const { entry = '.', framework = 'express' } = config;
  const files = glob.sync(`${entry}/**/*.@(js|ts|jsx|tsx)`, { 
    absolute: true,
    ignore: ['**/node_modules/**']
  });
  
  const routes = [];
  const appRouters = new Map();

  files.forEach(file => {
    const fileRoutes = parseFile(file, framework, appRouters);
    routes.push(...fileRoutes);
  });

  return routes;
}

module.exports = {
  parseCodebase
};