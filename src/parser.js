const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const { expressVisitor } = require('./express');
const { getPathValue, getHandlerName } = require('./utils');

function parseFile(filePath, framework, appRouters) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const ext = path.extname(filePath);
  const isTypeScript = ext === '.ts' || ext === '.tsx';

  const ast = parser.parse(content, {
    sourceType: 'module',
    plugins: [
      'jsx',
      isTypeScript ? 'typescript' : 'flow',
      'classProperties',
      'objectRestSpread'
    ]
  });

  const routes = [];
  let visitor;
  
  switch (framework) {
    case 'express':
      visitor = expressVisitor(filePath, routes, appRouters);
      break;
    default:
      throw new Error(`Unsupported framework: ${framework}`);
  }

  traverse(ast, visitor);
  return routes;
}

module.exports = {
  parseFile
};