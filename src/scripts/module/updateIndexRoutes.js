import fs from "fs";
import path from "path";


/**
 * Updates the `index.routes.js` file to register a new module's routes.
 */
export const updateIndexRoutes = (modulesPath, routeName, name) => {
    const indexRoutesPath = path.join(modulesPath, "index.routes.js");
  
    // Read or initialize index.routes.js
    let indexRoutesContent = fs.existsSync(indexRoutesPath)
      ? fs.readFileSync(indexRoutesPath, "utf8")
      : `export const bootstrap = (app, express) => {
    const routeverion = "/api";
    app.get(routeverion, (req, res) => res.send("Welcome!"));
  };\n`;
  
    const importStatement = `import ${routeName}Router from "./${routeName}/${routeName}.routes.js";\n`;
    const useStatement = `  app.use(\`\${routeverion}/${name}s\`, ${routeName}Router);\n`;
  
    // Add import statement if not present
    if (!indexRoutesContent.includes(importStatement)) {
      indexRoutesContent = importStatement + indexRoutesContent;
    }
  
    // Add route usage statement if not present
    if (!indexRoutesContent.includes(useStatement)) {
      const insertionPoint = "// End  Endpoints";
      if (indexRoutesContent.includes(insertionPoint)) {
        indexRoutesContent = indexRoutesContent.replace(
          `  ${insertionPoint}`,
          `${useStatement}  ${insertionPoint}`
        );
      } else {
        // Fallback: Append at the end if the marker is missing
        indexRoutesContent = indexRoutesContent.replace(
          "databaseConnection(); // database connection",
          `${useStatement}\n  databaseConnection(); // database connection`
        );
      }
    }
  
    fs.writeFileSync(indexRoutesPath, indexRoutesContent);
    console.log(`✅ Updated index.routes.js with "${routeName}" module!`);
  }