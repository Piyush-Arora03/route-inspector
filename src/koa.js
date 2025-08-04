const path = require('path');
const { getPathValue, getHandlerName } = require('./utils');

/**
 * A Babel visitor for finding Koa.js routes defined with `koa-router`.
 */
function koaVisitor(filePath, routes) {
  const routerIdentifiers = new Map(); // Tracks routers and their prefixes

  return {
    VariableDeclarator(path) {
      const { node } = path;
      if (!node.init || node.init.type !== 'NewExpression' || node.init.callee.name !== 'Router') {
        return;
      }

      const routerName = node.id.name;
      let prefix = '';

      // Check for a prefix in the constructor options: new Router({ prefix: '/api' })
      if (node.init.arguments.length > 0 && node.init.arguments[0].type === 'ObjectExpression') {
        const prefixNode = node.init.arguments[0].properties.find(p => p.key.name === 'prefix');
        if (prefixNode) {
          prefix = getPathValue(prefixNode.value);
        }
      }
      
      routerIdentifiers.set(routerName, { prefix });
    },

    CallExpression(path) {
      const { node } = path;
      if (node.callee.type !== 'MemberExpression') return;

      const objectName = node.callee.object.name;
      const methodName = node.callee.property.name;
      const httpMethods = new Set(['get', 'post', 'put', 'delete', 'patch', 'all']);

      // Find route definitions like: router.get('/path', ...)
      if (httpMethods.has(methodName) && routerIdentifiers.has(objectName)) {
        const args = node.arguments;
        if (args.length === 0) return;

        const routePath = getPathValue(args[0]);
        if (routePath === null) return;

        const handlers = args.slice(1);
        const middleware = handlers.map(handler => getHandlerName(handler));
        const routerInfo = routerIdentifiers.get(objectName);

        // Directly push the final, resolved route.
        routes.push({
          method: methodName.toUpperCase(),
          path: path.join(routerInfo.prefix, routePath).replace(/\\/g, '/'),
          middleware: middleware,
          file: filePath,
          line: node.loc.start.line
        });
      }
    },
  };
}

module.exports = {
  koaVisitor
};