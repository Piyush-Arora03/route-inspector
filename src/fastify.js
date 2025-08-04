const { getPathValue, getHandlerName } = require('./utils');

/**
 * A Babel visitor for finding Fastify.js routes.
 */
function fastifyVisitor(filePath, routes) {
  const fastifyFactories = new Set();
  const fastifyInstances = new Set();

  return {
    VariableDeclarator(path) {
      const { node } = path;
      if (!node.init) return;

      // Find `const fastify = require('fastify');`
      if (
        node.init.type === 'CallExpression' &&
        node.init.callee.name === 'require' &&
        node.init.arguments.length > 0 &&
        getPathValue(node.init.arguments[0]) === 'fastify'
      ) {
        fastifyFactories.add(node.id.name);
      }

      // Find `const app = fastify();`
      if (node.init.type === 'CallExpression' && fastifyFactories.has(node.init.callee.name)) {
        fastifyInstances.add(node.id.name);
      }
      
      // Handle combined `const app = require('fastify')();`
      if (
        node.init.type === 'CallExpression' &&
        node.init.callee.type === 'CallExpression' &&
        node.init.callee.callee.name === 'require' &&
        getPathValue(node.init.callee.arguments[0]) === 'fastify'
      ) {
        fastifyInstances.add(node.id.name);
      }
    },

    CallExpression(path) {
      const { node } = path;
      if (node.callee.type !== 'MemberExpression') return;

      const objectName = node.callee.object.name;
      const methodName = node.callee.property.name;
      const httpMethods = new Set(['get', 'post', 'put', 'delete', 'patch', 'head', 'options']);

      if (!fastifyInstances.has(objectName)) return;

      // Handle shorthand methods: fastify.get('/path', handler)
      if (httpMethods.has(methodName)) {
        const args = node.arguments;
        if (args.length < 2) return;

        const routePath = getPathValue(args[0]);
        const handler = args[1];

        routes.push({
          method: methodName.toUpperCase(),
          path: routePath,
          middleware: [getHandlerName(handler)],
          file: filePath,
          line: node.loc.start.line,
        });
      }

      // Handle the .route() method: fastify.route({ method, url, handler })
      if (methodName === 'route') {
        const args = node.arguments;
        if (args.length === 0 || args[0].type !== 'ObjectExpression') return;

        const properties = args[0].properties;
        const methodNode = properties.find(p => p.key.name === 'method');
        const urlNode = properties.find(p => p.key.name === 'url');
        const handlerNode = properties.find(p => p.key.name === 'handler');

        if (methodNode && urlNode && handlerNode) {
          let httpMethodsValue = getPathValue(methodNode.value);
          if (methodNode.value.type === 'ArrayExpression') {
              httpMethodsValue = methodNode.value.elements.map(el => getPathValue(el));
          }
          
          const routePath = getPathValue(urlNode.value);
          const methods = Array.isArray(httpMethodsValue) ? httpMethodsValue : [httpMethodsValue];

          methods.forEach(method => {
            routes.push({
              method: method.toUpperCase(),
              path: routePath,
              middleware: [getHandlerName(handlerNode.value)],
              file: filePath,
              line: node.loc.start.line,
            });
          });
        }
      }
    },
  };
}

module.exports = {
  fastifyVisitor,
};