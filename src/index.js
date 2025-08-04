const glob = require('glob');
const fs = require('fs');
const path = require('path');
const { parseFile } = require('./parser');
const { generateHtmlReport } = require('./report-generator');
const { resolveExpressRoutes } = require('./express');

function parseCodebase(config = {}) {
  const {
    entry = '.',
    framework = 'express',
    ignore = ['**/node_modules/**'],
    html,
  } = config;

  // Non-express logic remains the same
  if (framework !== 'express') {
    const files = glob.sync(`${entry}/**/*.@(js|ts|jsx|tsx)`, { absolute: true, ignore });
    const analysisData = { routers: new Map() };
    files.forEach(file => {
      try {
        parseFile(file, framework, analysisData);
      } catch (error) {
        console.warn(`Could not parse ${file}: ${error.message}`);
      }
    });
    
    let routes = [];
    analysisData.routers.forEach(router => routes.push(...router.routes));
    
    if (html && typeof html === 'string') {
      generateHtmlReport(routes, html);
    }
    return routes;
  }

  // --- EXPRESS LOGIC ---
  const entryPath = path.resolve(entry);
  let startFile = entryPath;

  if (fs.statSync(entryPath).isDirectory()) {
    const possibleFiles = ['index.js', 'app.js', 'main.js', 'server.js'];
    const possibleDirs = [entryPath, path.join(entryPath, 'src')];
    let found = false;
    for (const dir of possibleDirs) {
      for (const file of possibleFiles) {
        const fullPath = path.join(dir, file);
        if (fs.existsSync(fullPath)) {
          startFile = fullPath;
          found = true;
          break;
        }
      }
      if (found) break;
    }
    if (!found) {
      throw new Error(`Could not find an entry file in '${entryPath}' or its 'src' subdirectory.`);
    }
  }
  
  const files = glob.sync(`${entry}/**/*.@(js|ts|jsx|tsx)`, { absolute: true, ignore });
  
  const analysisData = {
    routers: new Map(),
    imports: new Map(),
  };

  // Pass 1: Build the Import Map
  files.forEach(file => {
    try {
      parseFile(file, 'express-imports', analysisData);
    } catch (error) {
      console.warn(`Could not parse for imports ${file}: ${error.message}`);
    }
  });

  // Pass 2: Find Routers, Routes, and Mounts
  files.forEach(file => {
    try {
      parseFile(file, 'express-routes', analysisData);
    } catch (error) {
      console.warn(`Could not parse for routes ${file}: ${error.message}`);
    }
  });

  // Pass 3: Resolve all paths
  const routes = resolveExpressRoutes(analysisData);
  
  if (html && typeof html === 'string') {
    generateHtmlReport(routes, html);
  }

  return routes;
}

module.exports = {
  parseCodebase
};