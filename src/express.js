const path = require('path');
const { getPathValue, getHandlerName } = require('./utils');

/**
 * A Babel visitor that finds all require() statements in a file
 * and populates a map of variable names to their resolved file paths.
 */
function createImportVisitor(filePath, analysisData) {
    return {
        VariableDeclarator(p) {
            const { node } = p;
            if (!node.init ||
                node.init.type !== 'CallExpression' ||
                node.init.callee.name !== 'require' ||
                node.init.arguments.length === 0) {
                return;
            }

            const sourcePath = getPathValue(node.init.arguments[0]);
            if (!sourcePath) return;

            try {
                const currentFileDir = path.dirname(filePath);
                const resolvedPath = require.resolve(sourcePath, { paths: [currentFileDir] });

                if (!analysisData.imports.has(filePath)) {
                    analysisData.imports.set(filePath, new Map());
                }
                const fileImportMap = analysisData.imports.get(filePath);

                if (node.id.type === 'ObjectPattern') {
                    for (const prop of node.id.properties) {
                        if (prop.key.type === 'Identifier') {
                            fileImportMap.set(prop.key.name, resolvedPath);
                        }
                    }
                } else if (node.id.type === 'Identifier') {
                    fileImportMap.set(node.id.name, resolvedPath);
                }
            } catch (e) { /* Ignore unresolved modules */ }
        }
    };
}

/**
 * A Babel visitor that finds Express router definitions, routes, and mounts.
 * It uses the pre-populated import map to identify mounted routers.
 */
function createRouteVisitor(filePath, analysisData) {
    const importMap = analysisData.imports.get(filePath) || new Map();
    return {
        VariableDeclarator(path) {
            const { node } = path;
            if (!node.init) return;

            const routerName = node.id.name;
            const isExpressInstance = node.init.type === 'CallExpression' && node.init.callee && node.init.callee.name === 'express';
            const isRouterInstance = node.init.type === 'CallExpression' && node.init.callee.type === 'MemberExpression' &&
                                     node.init.callee.object.name === 'express' && node.init.callee.property.name === 'Router';

            if (isExpressInstance || isRouterInstance) {
                if (!analysisData.routers.has(filePath)) {
                    analysisData.routers.set(filePath, { name: routerName, routes: [], mounts: [] });
                }
            }
        },

        CallExpression(path) {
            const { node } = path;
            if (node.callee.type !== 'MemberExpression') return;

            const objectName = node.callee.object.name;
            const methodName = node.callee.property.name;
            
            const currentRouterData = analysisData.routers.get(filePath);
            if (!currentRouterData || currentRouterData.name !== objectName) return;

            const httpMethods = new Set(['get', 'post', 'put', 'delete', 'patch', 'all']);
            if (httpMethods.has(methodName)) {
                const args = node.arguments;
                if (args.length === 0) return;
                const routePath = getPathValue(args[0]);
                if (routePath === null) return;
                
                const handlers = args.slice(1);
                const middleware = handlers.map(handler => getHandlerName(handler));
                currentRouterData.routes.push({ method: methodName.toUpperCase(), path: routePath, middleware, file: filePath, line: node.loc.start.line });
            }

            if (methodName === 'use') {
                const args = node.arguments;
                if (args.length === 0) return;
                
                let basePath = '/';
                let routerVariable;

                if (args.length > 1 && args[0].type === 'StringLiteral') {
                    basePath = getPathValue(args[0]);
                    routerVariable = args[1];
                } else {
                    routerVariable = args[0];
                }

                if (routerVariable && routerVariable.type === 'Identifier') {
                    const childRouterPath = importMap.get(routerVariable.name);
                    if (childRouterPath) {
                        currentRouterData.mounts.push({ prefix: basePath, childRouterPath: childRouterPath });
                    }
                }
            }
        }
    };
}

/**
 * Takes the raw analysis data and resolves all nested router paths.
 * @param {object} analysisData - The collected data from the parsers.
 * @returns {Array} The final array of route objects with full paths.
 */
function resolveExpressRoutes(analysisData) {
    const finalRoutes = [];
    const calculatedPaths = new Map();

    const childToParentMap = new Map();
    for (const [parentPath, parentData] of analysisData.routers.entries()) {
        for (const mount of parentData.mounts) {
            childToParentMap.set(mount.childRouterPath, { parentPath, prefix: mount.prefix });
        }
    }

    function resolvePath(routerFilePath) {
        if (calculatedPaths.has(routerFilePath)) return calculatedPaths.get(routerFilePath);
        if (childToParentMap.has(routerFilePath)) {
            const { parentPath, prefix } = childToParentMap.get(routerFilePath);
            const parentFullPath = resolvePath(parentPath);
            const fullPath = path.join(parentFullPath, prefix).replace(/\\/g, '/');
            calculatedPaths.set(routerFilePath, fullPath);
            return fullPath;
        }
        calculatedPaths.set(routerFilePath, '/');
        return '/';
    }

    for (const routerFilePath of analysisData.routers.keys()) {
        resolvePath(routerFilePath);
    }

    for (const [routerFilePath, routerData] of analysisData.routers.entries()) {
        const basePath = calculatedPaths.get(routerFilePath) || '/';
        routerData.routes.forEach(route => {
            let finalPath = path.join(basePath, route.path).replace(/\\/g, '/');
            if (finalPath.length > 1 && finalPath.endsWith('/')) {
                finalPath = finalPath.slice(0, -1);
            }
            finalRoutes.push({ ...route, path: finalPath || '/' });
        });
    }

    return finalRoutes;
}

module.exports = {
  createImportVisitor,
  createRouteVisitor,
  resolveExpressRoutes
};