# Route Inspector

[![Node.js CI](https://github.com/Piyush-Arora03/route-inspector/workflows/Node.js%20CI/badge.svg)](https://github.com/Piyush-Arora03/route-inspector/actions)
[![npm version](https://img.shields.io/npm/v/route-inspector.svg)](https://www.npmjs.com/package/route-inspector)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

**A powerful static analysis tool to visualize and document your Express, Koa, and Fastify APIs.**

Route Inspector automatically analyzes your codebase to extract detailed information about all routes, middleware, and handlers. It helps you visualize your API structure, generate professional documentation, and maintain a clean, secure codebase—all without running your application.

## Why Route Inspector?

-   **Standardize Documentation:** Generate an industry-standard OpenAPI (Swagger) specification to use with a vast ecosystem of tools.
-   **Visualize Your API:** Create an interactive HTML report to get a complete, searchable overview of all API endpoints in seconds.
-   **Improve Security:** Quickly identify routes from the report that are missing authentication or authorization middleware.
-   **Refactor with Confidence:** See the impact of your changes on the API surface by comparing outputs before and after you refactor.

## Key Features

-   **Multi-Framework Support:** Analyzes Express.js, Koa, and Fastify applications.
-   **OpenAPI Spec Generation:** Creates a valid OpenAPI 3.0 specification file for professional API documentation.
-   **Interactive HTML Reports:** Generates a searchable and sortable HTML report for quick visualization.
-   **Source Code Linking:** Shows the exact file and line number for each route definition.
-   **Configuration Files:** Reads settings from `inspector.config.js` for project-specific configurations.

## Installation

For the best experience, install the CLI tool globally:

```bash
npm install -g route-inspector
```

Alternatively, you can use it directly without installation via `npx`.

## Usage & Outputs

Route Inspector can generate powerful documentation and data for your project.

### 1. OpenAPI Specification (Recommended for Tooling)

Generate a standard `openapi.json` file. This file can be imported into tools like Swagger UI, Postman, or other API gateways.

```bash
route-inspector /path/to/your-app --framework fastify --openapi spec.json
```

> **Tip:** You can paste the content of the generated `spec.json` file into the online [Swagger Editor](https://editor.swagger.io/) to instantly see your interactive API documentation.

### 2. HTML Report (for Quick Visualization)

Generate a self-contained, interactive HTML file with a searchable table of all your routes.

```bash
route-inspector /path/to/your-app --framework koa --html report.html
```

> **Note:** To view the generated HTML file, you should open it using a local web server (like the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension in VS Code) due to browser security restrictions.

### 3. JSON Output (for Scripting)

To get the raw route data as a JSON array for scripting, simply run the tool without any output flags.

```bash
route-inspector /path/to/your-app --framework express
```

## CLI Options

| Option      | Description                                           | Default        |
|-------------|-------------------------------------------------------|----------------|
| `[entry]`   | The path to the codebase you want to analyze.         | `.` (current dir)|
| `--framework` | The framework to analyze (express, koa, or fastify).  | `express`      |
| `--openapi`   | The file path where the OpenAPI spec should be saved. |                |
| `--html`, `-o`| The file path where the HTML report should be saved.  |                |

## Configuration File

For complex projects, you can define your settings in a configuration file at your project's root, such as `inspector.config.js`.

**Example `inspector.config.js`:**

```javascript
module.exports = {
  framework: 'express',
  entry: './src',
  openapi: 'docs/api-spec.json',
  ignore: ['**/node_modules/**', '**/test/**'],
};
```

With this file in place, you can simply run:
```bash
route-inspector
```

## Advanced Usage & Recipes

### Find Unprotected Routes via CLI

You can pipe the JSON output to a tool like `jq` to perform powerful, one-line queries. This example finds all routes that do not have middleware named 'auth' or 'isLoggedIn'.

*(Requires [jq](https://stedolan.github.io/jq/) to be installed)*

```bash
route-inspector . --framework express | jq '[.[] | select(.middleware | any(contains("auth") or contains("isLoggedIn")) | not)]'
```

### Generate Custom Documentation via Script

For complete control, use the programmatic API. Create a script like `generate-docs.js` to generate custom documentation files.

```javascript
// generate-docs.js
const fs = require('fs');
const path = require('path');
const { parseCodebase } = require('route-inspector');

console.log('Generating custom route documentation...');

const routes = parseCodebase({
    entry: './app', // Path to the project to analyze
    framework: 'express'
});

const markdown = routes.map(route =>
  `### ${route.method} ${route.path}\n` +
  `- **File**: ${path.basename(route.file)}:${route.line}\n` +
  `- **Middleware**: \`\`${route.middleware.join(', ')}\`\`\n`
).join('\n---\n');

const outputPath = 'CUSTOM_ROUTES.md';
fs.writeFileSync(outputPath, '# API Routes\n\n' + markdown);

console.log(`✅ Custom documentation generated at ${outputPath}`);
```

Run the script from your terminal:

```bash
node generate-docs.js
```

## How It Works

Route Inspector uses the [Babel](https://babeljs.io/) parser to perform static analysis on your codebase. It identifies framework instances (like an Express `app` or a `koa-router`), finds all route definitions, tracks middleware, resolves mounted router paths, and maps all routes back to their source file and line number.

## Roadmap

-   [x] Express.js support
-   [x] Command-Line Interface (CLI) version
-   [x] Koa.js support
-   [x] Fastify support
-   [x] Swagger/OpenAPI specification generation
-   [ ] Route visualization (graphical output)

## Contributing

Contributions are welcome! Please fork the repository, make your changes, and submit a pull request.

## License

This project is licensed under the ISC License.
