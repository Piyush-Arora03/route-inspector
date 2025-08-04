const path = require('path');
const { getPathValue, getHandlerName } = require('./utils');

function koaVisitor(filePath, routes) {
  // Map to store router variables and their associated data (prefix, routes)
  const routerIdentifiers = new Map();

  return {
    VariableDeclarator(path) {
      const { node } = path;
      if (!node.init) return;

      // Find: const router = new Router({ prefix: '/api' });
      if (node.init.type === 'NewExpression' && node.init.callee.name === 'Router') {
        const routerName = node.id.name;
        let prefix = '';

        if (node.init.arguments.length > 0 && node.init.arguments[0].type === 'ObjectExpression') {
          const prefixNode = node.init.arguments[0].properties.find(p => p.key.name === 'prefix');
          if (prefixNode) {
            prefix = getPathValue(prefixNode.value);
          }
        }
        
        routerIdentifiers.set(routerName, { prefix, routes: [] });
      }
    },

    CallExpression(path) {
      const { node } = path;
      if (node.callee.type !== 'MemberExpression') return;

      const objectName = node.callee.object.name;
      const methodName = node.callee.property.name;
      const httpMethods = new Set(['get', 'post', 'put', 'delete', 'patch', 'all']);

      // Find: router.get('/path', ...);
      if (httpMethods.has(methodName) && routerIdentifiers.has(objectName)) {
        const args = node.arguments;
        if (args.length === 0) return;

        const routePath = getPathValue(args[0]);
        if (routePath === null) return;

        const handlers = args.slice(1);
        const middlewareNames = handlers.map(handler => getHandlerName(handler));

        const routeInfo = {
          method: methodName.toUpperCase(),
          path: routePath,
          middleware: middlewareNames,
          file: filePath,
          line: node.loc.start.line
        };
        
        // Temporarily store the route on the router object
        routerIdentifiers.get(objectName).routes.push(routeInfo);
      }
    },

    Program: {
      exit() {
        // This runs after the whole file is traversed
        // Now, process all the routers we found
        routerIdentifiers.forEach(router => {
          router.routes.forEach(route => {
            // Create the full path by prepending the router's prefix
            const fullPath = path.join(router.prefix, route.path).replace(/\\/g, '/');
            
            // Push the final, complete route object to the main routes array
            routes.push({
              ...route,
              path: fullPath
            });
          });
        });
      }
    }
  };
}

module.exports = {
  koaVisitor
};