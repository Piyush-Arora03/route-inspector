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
  
  switch (handler.type) {
    case 'Identifier':
      return handler.name;
    case 'FunctionExpression':
    case 'ArrowFunctionExpression':
      return '<function>';
    case 'CallExpression':
      return handler.callee.name || '<call>';
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