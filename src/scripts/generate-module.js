import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { spawn } from "child_process";
import {
  generateModelFile,
  generateControllerFile,
  generateRouteFile,
  generateValidationFile,
  updateIndexRoutes,
} from "../utils/moduleGenerator.js";
import { formatRouteName } from "./helpers.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootPath = path.join(__dirname, "..", "..");

// Paths
const modulesPath = path.join(rootPath, "src", "modules");
const modelsPath = path.join(rootPath, "src", "database", "models");

// ✅ Resolve absolute path to `modelsConfig.js`
const modelsConfigPath = pathToFileURL(
  path.join(rootPath, "src/config/modelsConfig.js")
).href;

// Ensure directories exist
if (!fs.existsSync(modelsPath)) fs.mkdirSync(modelsPath, { recursive: true });
if (!fs.existsSync(modulesPath)) fs.mkdirSync(modulesPath, { recursive: true });

// ✅ Import dynamically and use the exported `modelsConfig`
import(modelsConfigPath)
  .then((module) => {
    const { modelsConfig } = module;

    if (!modelsConfig || !Array.isArray(modelsConfig)) {
      throw new Error("modelsConfig is not an array or is undefined!");
    }

    modelsConfig.forEach((config) => {
      const { name } = config;
      const routeName = formatRouteName(name);
      const modulePath = path.join(modulesPath, routeName);
      const modelPath = path.join(modelsPath, `${routeName}.model.js`);
      const controllerPath = path.join(modulePath, `${routeName}.controller.js`);
      const routePath = path.join(modulePath, `${routeName}.routes.js`);
      const validationPath = path.join(modulePath, `${routeName}.validation.js`);

      if (!fs.existsSync(modulePath))
        fs.mkdirSync(modulePath, { recursive: true });

      // ✅ generate Model
      generateModelFile(modelPath, config);
      // ✅ generate Controller
      generateControllerFile(controllerPath, config);
      // ✅ generate Route
      generateRouteFile(routePath, routeName);
      // ✅ generate Validation
      generateValidationFile(validationPath);
      // ✅ Update index.routes.js
      updateIndexRoutes(modulesPath, routeName, name);

      console.log(`✅ Module "${routeName}" created successfully!`);
    });

    console.log("🚀 Restarting server with npm run dev...");

    const serverProcess = spawn("npm", ["run", "dev"], {
      stdio: "inherit",
      shell: true,
      cwd: rootPath,
    });

    serverProcess.on("exit", (code) => {
      console.log(`🔄 Server process exited with code ${code}`);
    });
  })
  .catch((error) => console.error("❌ Error importing modelsConfig:", error));
