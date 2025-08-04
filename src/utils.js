function getPathValue(node) {
  if (!node) return null;
  
  switch (node.type) {
    case 'StringLiteral':
      return node.value;
    case 'TemplateLiteral':
      if (node.expressions.length === 0) {
        return node.quasis[0].value.cooked;
      }
      return null;
    default:
      return null;
  }
}

function getHandlerName(handler) {
  if (!handler) return '<unknown>';

  // This recursive helper function can trace nested objects and require calls.
  const getFullName = (node) => {
    if (node.type === 'Identifier') {
      return node.name;
    }
    if (node.type === 'MemberExpression') {
      const objectName = getFullName(node.object);
      const propertyName = node.property.name;
      return `${objectName}.${propertyName}`;
    }
    // This handles the case where the handler is like: require('../controllers/user').createUser
    if (node.type === 'CallExpression' && node.callee.name === 'require') {
      if (node.arguments.length > 0 && node.arguments[0].type === 'StringLiteral') {
        return `require('${node.arguments[0].value}')`;
      }
      return 'require(...)';
    }
    if (node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') {
        return '<function>';
    }
    return '<computed>';
  };
  
  switch (handler.type) {
    case 'Identifier':
    case 'MemberExpression':
    case 'FunctionExpression':
    case 'ArrowFunctionExpression':
      return getFullName(handler);
    case 'ArrayExpression':
      return handler.elements.map(el => getHandlerName(el));
    default:
      return '<unknown>';
  }
}

module.exports = {
  getPathValue,
  getHandlerName
};