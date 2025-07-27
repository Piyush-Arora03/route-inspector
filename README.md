# Route Inspector

[![Node.js CI](https://github.com/Piyush-Arora03/route-inspector/workflows/Node.js%20CI/badge.svg)](https://github.com/Piyush-Arora03/route-inspector/actions)
[![npm version](https://img.shields.io/npm/v/route-inspector.svg)](https://www.npmjs.com/package/route-inspector)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

> A powerful static analysis tool for Express.js applications.

Route Inspector automatically analyzes your codebase to extract detailed information about all routes, middleware, and handlers. It helps developers visualize and document their API structure, identify potential security issues, and maintain cleaner codebases without running the application.

## Key Features

- 🔍 **Automatic Route Discovery**: Finds all routes in your Express app.
- 📊 **Middleware Analysis**: Identifies authentication and authorization middleware.
- 🗺️ **Route Mapping**: Generates complete route path maps with HTTP methods.
- 📍 **Source Tracking**: Shows the exact file and line number for route definitions.
- 🛡️ **Security Auditing**: Highlights routes that may be missing authentication.
- ⚙️ **Framework Support**: Currently supports Express.js, with plans to be extensible.

## Installation

```bash
npm install route-inspector
# or
yarn add route-inspector
```

## Usage

### Basic Example

```javascript
const { parseCodebase } = require('route-inspector');

const routes = parseCodebase({
  entry: './src',        // Path to your application
  framework: 'express'   // Currently supports Express.js
});

console.log('Discovered Routes:');
console.log(routes);
```

### Sample Output

```json
[
  {
    "method": "GET",
    "path": "/api/users",
    "middleware": ["auth", "adminOnly"],
    "file": "/src/routes/users.js",
    "line": 15
  },
  {
    "method": "POST",
    "path": "/api/login",
    "middleware": ["<function>"],
    "file": "/src/routes/auth.js",
    "line": 8
  }
]
```

## API Documentation

### `parseCodebase(config)`

The main function that analyzes your codebase and returns route information.

#### Parameters

*   `config` (Object): An object with the following properties:
    *   **`entry`** (String): Path to your application directory. *Default: `.`*
    *   **`framework`** (String): Framework to analyze. *Default: `'express'`*
    *   **`ignore`** (Array): Optional list of glob patterns to ignore. *Default: `['**/node_modules/**']`*

#### Returns

An `Array` of route objects with the following properties:

*   **`method`**: HTTP method (e.g., `GET`, `POST`).
*   **`path`**: Complete route path.
*   **`middleware`**: An array of middleware/handler identifiers.
*   **`file`**: The absolute path to the source file.
*   **`line`**: The line number in the source file.

## Advanced Usage

### Analyze Specific Files

```javascript
const routes = parseCodebase({
  entry: './src/routes', // Analyze only the routes directory
  framework: 'express'
});
```

### Identify Potentially Unprotected Routes

```javascript
const routes = parseCodebase({ entry: './app', framework: 'express' });

const unprotectedRoutes = routes.filter(route => 
  !route.middleware.some(mw => 
    mw.includes('auth') || mw.includes('authenticate')
  )
);

console.log('Unprotected routes:');
console.log(unprotectedRoutes);
```

### Generate Route Documentation

```javascript
const fs = require('fs');
const routes = parseCodebase({ entry: '.', framework: 'express' });

const markdown = routes.map(route => 
  `### ${route.method} ${route.path}\n` +
  `- **File**: ${route.file}:${route.line}\n` +
  `- **Middleware**: ${route.middleware.join(', ')}\n`
).join('\n');

fs.writeFileSync('ROUTES.md', '# API Routes\n\n' + markdown);
```

## Use Cases

*   **Automated API Documentation**: Generate always-up-to-date route documentation.
*   **Security Auditing**: Quickly identify potentially unprotected routes.
*   **Codebase Analysis**: Understand complex route structures and middleware chains.
*   **Migration Assistance**: Map out routes before converting an Express app to another framework.
*   **Testing**: Verify route coverage in tests.
*   **Performance Optimization**: Identify route-specific middleware bottlenecks.

## How It Works

Route Inspector uses the Babel parser to perform static analysis on your codebase. It:

1.  Identifies Express `app` and `router` instances.
2.  Finds all route definitions (e.g., `app.get`, `app.post`, `router.use`).
3.  Tracks middleware functions and their names.
4.  Resolves mounted router paths to build the full route URL.
5.  Maps all routes back to their source file and line number.

## Contributing

Contributions are welcome! Here's how to get started:

1.  Fork the repository.
2.  Install dependencies: `npm install`
3.  Make your changes.
4.  Run tests: `npm test`
5.  Submit a pull request.

## Roadmap

- [x] Express.js support
- [ ] Koa.js support
- [ ] Fastify support
- [ ] Role-based access control (RBAC) analysis
- [ ] Route visualization (graphical output)
- [ ] Swagger/OpenAPI specification generation
- [ ] Command-Line Interface (CLI) version

## License

This project is licensed under the ISC License - see the `LICENSE` file for details.

---

*Route Inspector was created to solve the common problem of undocumented, hard-to-track routes in large Express.js applications. By automatically analyzing your codebase, it helps you maintain a clean, well-documented, and secure API.*