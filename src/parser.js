const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const { createImportVisitor, createRouteVisitor } = require('./express');
const { koaVisitor } = require('./koa');
const { fastifyVisitor } = require('./fastify');

function parseFile(filePath, framework, analysisData) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const ast = parser.parse(content, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript', 'classProperties', 'objectRestSpread']
  });

  let visitor;
  switch (framework) {
    case 'express-imports':
      visitor = createImportVisitor(filePath, analysisData);
      break;
    case 'express-routes':
      visitor = createRouteVisitor(filePath, analysisData);
      break;
    case 'koa':
      // Add Koa logic here if needed, similar to the simplified Express logic
      break;
    case 'fastify':
      // Add Fastify logic here if needed
      break;
    default:
      return;
  }
  
  traverse(ast, visitor);
}

module.exports = {
  parseFile
};