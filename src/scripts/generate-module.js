import fs from "fs";
import path from "path";
import readline from "readline/promises";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
import { formatRouteName } from "./helpers.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Move up from "scripts" to root, then into "src/modules"
const rootPath = path.join(__dirname, "..", ".."); // Moves out of "scripts" to project root
const modulesPath = path.join(rootPath, "src", "modules");
const indexRoutesPath = path.join(modulesPath, "index.routes.js");

// Setup readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

(async () => {
  try {
    let name = (await rl.question("Enter module name: ")).trim();
    const routeName = formatRouteName(name);
    if (!name) {
      console.log("❌ module name is required!");
      rl.close();
      return;
    }
    const folderPath = path.join(modulesPath, routeName);
    const controllerPath = path.join(folderPath, `${routeName}.controller.js`);
    const routePath = path.join(folderPath, `${routeName}.routes.js`);
    const validationPath = path.join(folderPath, `${routeName}.validation.js`);

    // Create module folder
    if (fs.existsSync(folderPath)) {
      console.log(`❌ ${name} folder already exists!`);
      rl.close();
      return;
    }

    fs.mkdirSync(folderPath, { recursive: true });

    fs.writeFileSync(
      controllerPath,
      `
// (controller) get all ${routeName}s
export const getAll = (req, res) => res.json({ message: "Get all ${routeName}s" });
// (controller) get one ${routeName}
export const getOne = (req, res) => res.json({ message: "Get one ${routeName}" });
// (controller) create one ${routeName}
export const create = (req, res) => res.json({ message: "Create ${routeName}" });
// (controller) update one ${routeName}
export const update = (req, res) => res.json({ message: "Update ${routeName}" });
// (controller) delete one ${routeName}
export const deleteItem = (req, res) => res.json({ message: "Delete ${routeName}" });\n`
    );

    // Create routes file

    fs.writeFileSync(
      routePath,
      `import express from "express";
import * as controller from "./${routeName}.controller.js";
import {
  createValidation,
  deleteValidation,
  getOneValidation,
  updateValidation,
} from "./${routeName}.validation.js";
import { validation } from "../../middleware/globels/validation.js";

const router = express.Router();
// (route) get all ${routeName}s
router.get("/", controller.getAll);
// (route) get one ${routeName}
router.get("/:id", validation(getOneValidation), controller.getOne);
// (route) create one ${routeName}
router.post("/", validation(createValidation), controller.create);
// (route) update one ${routeName}
router.put("/:id", validation(updateValidation), controller.update);
// (route) delete one ${routeName}
router.delete("/:id", validation(deleteValidation), controller.deleteItem);

export default router;
        \n`
    );
    // validation routes file
    fs.writeFileSync(
      validationPath,
      `import Joi from "joi";
// (Validation) create ${routeName}
export const createValidation = Joi.object({});
// (Validation) update ${routeName}
export const updateValidation = Joi.object({});
// (Validation) deleta ${routeName}
export const deleteValidation = Joi.object({});
// (Validation) get One ${routeName}
export const getOneValidation = Joi.object({});\n`
    );

    // Update index.routes.js
    let indexRoutesContent = fs.existsSync(indexRoutesPath)
      ? fs.readFileSync(indexRoutesPath, "utf8")
      : `export const bootstrap = (app, express) => {
  const routeverion = "/api";
  app.get(routeverion, (req, res) => res.send("Welcome!"));
};\n`;

    const importStatement = `import ${routeName}Router from "./${routeName}/${routeName}.routes.js";\n`;
    const useStatement = `  app.use(\`\${routeverion}/${name}s\`, ${routeName}Router);\n`;

    if (!indexRoutesContent.includes(importStatement)) {
      indexRoutesContent = importStatement + indexRoutesContent;
    }

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
    console.log(
      `✅ module "${routeName}" created successfully in src/modules/${routeName}!`
    );
    console.log("🚀 Restarting server with npm run dev...");
    const serverProcess = spawn("npm", ["run", "dev"], {
      stdio: "inherit", // Show logs in terminal
      shell: true, // Ensures cross-platform compatibility
      cwd: rootPath, // Ensure it's running in the project root
    });

    serverProcess.on("exit", (code) => {
      console.log(`🔄 Server process exited with code ${code}`);
    });
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    rl.close();
  }
})();
