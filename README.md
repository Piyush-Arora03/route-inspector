# Route Inspector

[![Node.js CI](https://github.com/Piyush-Arora03/route-inspector/workflows/Node.js%20CI/badge.svg)](https://github.com/Piyush-Arora03/route-inspector/actions)
[![npm version](https://img.shields.io/npm/v/route-inspector.svg)](https://www.npmjs.com/package/route-inspector)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

**A powerful static analysis tool for Express.js, Koa, and Fastify applications.**

Route Inspector automatically analyzes your codebase to extract detailed information about all routes, middleware, and handlers. It helps you visualize your API structure, identify potential security issues, and maintain a clean codebase—all without running your application.

## Why Route Inspector?

-   **Understand Codebases Faster:** Get a complete overview of all API endpoints in seconds.
-   **Improve Security:** Quickly identify routes that are missing authentication or authorization middleware.
-   **Refactor with Confidence:** See the impact of your changes on the API surface.
-   **Maintain Documentation:** Generate up-to-date reports of your project's routes.

## Key Features

-   **Multi-Framework Support:** Analyzes Express.js, Koa, and Fastify applications.
-   **Interactive HTML Reports:** Generates a searchable and sortable HTML report.
-   **Source Code Linking:** Shows the exact file and line number for each route definition.
-   **Security Auditing:** Highlights routes that may be missing authentication middleware.
-   **Configuration Files:** Reads settings from `inspector.config.js` for project-specific configurations.

## Installation

For the best experience, install the CLI tool globally:

```bash
npm install -g route-inspector
```

Alternatively, you can use it directly without installation via `npx`.

## Usage

The easiest way to use Route Inspector is from the command line. You must specify which framework your project uses.

### Generate an HTML Report

This is the recommended way to use the tool. It provides a searchable table of all your routes.

```bash
# Analyze a Koa.js project
route-inspector /path/to/your-app --framework koa --html report.html
```

> **Note on Viewing the Report:**
> To view the generated HTML file, you should open it using a local web server due to browser security restrictions. A simple way is to use the **Live Server** extension in VS Code.

### Get JSON Output

To get the raw route data as a JSON array, simply run the tool without the `--html` flag. This is useful for piping the output to other tools like `jq`.

```bash
route-inspector /path/to/your-app --framework express | jq
```

### CLI Options

| Option              | Description                                                     | Default             |
| ------------------- | --------------------------------------------------------------- | ------------------- |
| `[entry]`           | The path to the codebase you want to analyze.                   | `.` (current dir)   |
| `--framework`       | The framework to analyze (`express`, `koa`, or `fastify`).      | `express`           |
| `--html`, `-o`      | The file path where the HTML report should be saved.            |                     |

## Configuration File

For complex projects, you can define your settings in a configuration file at your project's root. The tool will automatically find and use it.

Supported file names: `inspector.config.js`, `.inspectorrc`, `.inspectorrc.json`, or an `"inspector"` key in `package.json`.

**Example `inspector.config.js`:**

```javascript
module.exports = {
  framework: 'koa',
  entry: './src',
  html: 'reports/api-routes.html',
  ignore: ['**/node_modules/**', '**/test/**'],
};
```

With this file in place, you can simply run the command:

```bash
route-inspector
```

## Advanced: Programmatic API

For custom integrations, you can use Route Inspector programmatically.

### `parseCodebase(config)`

The `parseCodebase` function is the core of the tool. It accepts a configuration object and returns an array of route objects.

```javascript
const { parseCodebase } = require('route-inspector');

const routes = parseCodebase({
  entry: './src',
  framework: 'koa', // Can be 'express', 'koa', or 'fastify'
});

console.log(routes);
```

**Configuration:**

-   `entry` (String): Path to the application directory. Default: `.`
-   `framework` (String): The framework to analyze. Default: `express`
-   `ignore` (Array): An optional list of glob patterns to ignore files.
-   `html` (String): If provided, generates an HTML report at the specified file path.

## How It Works

Route Inspector uses the **Babel parser** to perform static analysis on your codebase. It identifies framework instances (like an Express `app` or a `koa-router`), finds all route definitions, tracks middleware, resolves mounted router paths, and maps all routes back to their source file and line number.

## Roadmap

-   [x] Express.js support
-   [x] Command-Line Interface (CLI) version
-   [x] Koa.js support
-   [x] Fastify support
-   [ ] Route visualization (graphical output)
-   [ ] Swagger/OpenAPI specification generation

## Contributing

Contributions are welcome! Please fork the repository, make your changes, and submit a pull request.

## License

This project is licensed under the ISC License.
