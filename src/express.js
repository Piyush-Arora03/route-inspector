const { getPathValue, getHandlerName } = require('./utils');

function expressVisitor(filePath, routes, appRouters) {
  const appIdentifiers = new Set();
  const routerIdentifiers = new Map();
  const mountedRouters = new Map();

  return {
    VariableDeclarator(path) {
      const { node } = path;
      if (!node.init) return;

      // Track express app instances
      if (node.init.type === 'CallExpression' && 
          node.init.callee && 
          node.init.callee.name === 'express') {
        appIdentifiers.add(node.id.name);
      }

      // Track express routers
      if (node.init.type === 'CallExpression' && 
          node.init.callee.type === 'MemberExpression' &&
          node.init.callee.object.name === 'express' && 
          node.init.callee.property.name === 'Router') {
        routerIdentifiers.set(node.id.name, {
          variableName: node.id.name,
          filePath,
          routes: []
        });
      }
    },

    CallExpression(path) {
      const { node } = path;
      if (node.callee.type !== 'MemberExpression') return;

      const objectName = node.callee.object.name;
      const methodName = node.callee.property.name;
      const httpMethods = new Set(['get', 'post', 'put', 'delete', 'patch', 'use', 'all']);

      // Process route definitions
      if (httpMethods.has(methodName) && 
          (appIdentifiers.has(objectName) || routerIdentifiers.has(objectName))) {
        
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

        if (routerIdentifiers.has(objectName)) {
          routerIdentifiers.get(objectName).routes.push(routeInfo);
        } else {
          routes.push(routeInfo);
        }
      }

      // Process router mounting
      if (methodName === 'use' && appIdentifiers.has(objectName)) {
        const args = node.arguments;
        if (args.length < 2) return;

        const basePath = getPathValue(args[0]);
        const routerArg = args[1];

        if (routerArg.type === 'Identifier' && routerIdentifiers.has(routerArg.name)) {
          mountedRouters.set(routerArg.name, basePath);
        }
      }
    },

    Program: {
      exit() {
        // Apply mounted routers base paths
        routerIdentifiers.forEach((router, routerName) => {
          if (mountedRouters.has(routerName)) {
            const basePath = mountedRouters.get(routerName);
            router.routes.forEach(route => {
              routes.push({
                ...route,
                path: path.join(basePath, route.path).replace(/\\/g, '/')
              });
            });
          } else {
            routes.push(...router.routes);
          }
        });
      }
    }
  };
}

module.exports = {
  expressVisitor
};