const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

function generateHtmlReport(routes, outputFile) {
  // Read the EJS template file
  const templatePath = path.resolve(__dirname, 'report-template.ejs');
  const template = fs.readFileSync(templatePath, 'utf-8');

  // Render the HTML using the routes data
  const html = ejs.render(template, { routes });

  // Write the final HTML to the specified output file
  const outputDir = path.dirname(outputFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  fs.writeFileSync(outputFile, html);
  console.log(`✅ HTML report generated at: ${outputFile}`);
}

module.exports = {
  generateHtmlReport
};