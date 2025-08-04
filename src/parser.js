const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const { expressVisitor } = require('./express');
const { koaVisitor } = require('./koa');
const { fastifyVisitor } = require('./fastify');
const { error } = require('console');

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
  
  // This switch statement now correctly handles all three frameworks
  switch (framework) {
    case 'express':
      visitor = expressVisitor(filePath, routes, appRouters);
      break;
    case 'koa':
      visitor = koaVisitor(filePath, routes);
      break;
    case 'fastify':
      visitor = fastifyVisitor(filePath, routes);
      break;
    default:
      console.error(`Unsupported framework: ${framework}`);
      return []; // Return empty array for files that don't match the framework
  }

  traverse(ast, visitor);
  return routes;
}

module.exports = {
  parseFile
};