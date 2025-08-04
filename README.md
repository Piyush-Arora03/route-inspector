# Route Inspector

[![Node.js CI](https://github.com/Piyush-Arora03/route-inspector/workflows/Node.js%20CI/badge.svg)](https://github.com/Piyush-Arora03/route-inspector/actions)
[![npm version](https://img.shields.io/npm/v/route-inspector.svg)](https://www.npmjs.com/package/route-inspector)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

> A powerful static analysis tool for **Express.js** applications.

Route Inspector automatically analyzes your codebase to extract detailed information about all routes, middleware, and handlers. It helps you visualize your API structure, identify potential security issues, and maintain a clean codebase—all without running your application.

```bash
# Analyze your project and generate an interactive HTML report
$ npx route-inspector . --html report.html

🔍 Starting analysis of "/path/to/your-project"...
✅ HTML report generated at: report.html
✨ Analysis complete. Found 25 routes.
```

## Key Features

- 🔍 **Automatic Route Discovery**: Finds all routes and middleware in your Express app.
- 🗺️ **Interactive HTML Reports**: Generates a searchable and sortable HTML report.
- 📍 **Source Code Linking**: Shows the exact file and line number for each route definition.
- 🛡️ **Security Auditing**: Highlights routes that may be missing authentication middleware.
- ⚙️ **Framework Support**: Built for Express.js, with an extensible architecture.

## Installation

For the best experience, install the CLI tool globally:

```bash
npm install -g route-inspector
```

Alternatively, you can use it directly without installation via `npx`.

## Usage

The easiest way to use Route Inspector is from the command line.

### Command-Line Interface (CLI)

#### **Generate an HTML Report**

This is the recommended way to use Route Inspector. The interactive HTML report provides a searchable and sortable table of all your routes.

```bash
route-inspector /path/to/your-app --html report.html
```

If you are already inside your project directory, you can just use `.` as the path:

```bash
route-inspector . --html report.html
```

#### **Get JSON Output**

To get the raw route data as a JSON array printed to the console, simply run the tool without the `--html` flag. This is useful for piping the output to other tools like `jq`.

```bash
route-inspector /path/to/your-app
```

#### **CLI Options**

-   `[entry]`: The path to the codebase you want to analyze. Defaults to the current directory (`.`).
-   `--html`, `-o`: The file path where the HTML report should be saved.

---

### Advanced: Programmatic API

For more complex integrations, you can use Route Inspector programmatically within your own scripts.

#### `parseCodebase(config)`

The `parseCodebase` function is the core of the tool. It accepts a configuration object and returns an array of route objects.

```javascript
const { parseCodebase } = require('route-inspector');

const routes = parseCodebase({
  entry: './src',        // Path to your application
  framework: 'express',  // Currently supports Express.js
});

console.log(routes);
```

**Configuration:**

-   `entry` (String): Path to the application directory. **Default**: `.`
-   `framework` (String): The framework to analyze. **Default**: `'express'`
-   `ignore` (Array): An optional list of glob patterns to ignore files.
-   `html` (String): If provided, generates an HTML report at the specified file path.

#### **Example: Find Unprotected Routes**

You can use the programmatic API to build custom security checks.

```javascript
const routes = parseCodebase({ entry: './app' });

const unprotectedRoutes = routes.filter(route =>
  !route.middleware.some(mw =>
    mw.includes('auth') || mw.includes('authenticate')
  )
);

console.log('Potentially Unprotected Routes:');
console.log(unprotectedRoutes);
```

## How It Works

Route Inspector uses the **Babel parser** to perform static analysis on your codebase. It identifies Express `app` and `router` instances, finds all route definitions (e.g., `app.get`), tracks middleware, resolves mounted router paths, and maps all routes back to their source file and line number.

## Roadmap

- [x] Express.js support
- [x] Command-Line Interface (CLI) version
- [ ] Koa.js support
- [ ] Fastify support
- [ ] Route visualization (graphical output)
- [ ] Swagger/OpenAPI specification generation

## Contributing

Contributions are welcome! Please fork the repository, make your changes, and submit a pull request.

## License

This project is licensed under the [ISC License](LICENSE).
