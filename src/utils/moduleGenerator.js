import fs from "fs";
import path from "path";

/**
 * Generates the model file.
 */
export const generateModelFile = (modelPath, { name, modelName, schemaFields }) => {
  const schemaDefinition = Object.entries(schemaFields)
    .map(([key, type]) => `${key}: { type: ${type}, required: true }`)
    .join(",\n  ");

  const content = `import mongoose from "mongoose";

const ${name}Schema = new mongoose.Schema({
  ${schemaDefinition}
}, { timestamps: true });

export const ${modelName}Model = mongoose.model("${modelName}", ${name}Schema);
`;

  fs.writeFileSync(modelPath, content);
}

/**
 * Generates the controller file.
 */
export const generateControllerFile = (
  controllerPath,
  { name, modelName, slug, pushToPipeline, options, relationCacheTags, useCrudHandler }
) => {
  const content = useCrudHandler
    ? `import { deleteOne, FindAll, FindOne, InsertOne, updateOne } from "../handlers/crudHandler.js";
import ${modelName} from "../../database/models/${name}.model.js";

const config = {
  model: ${modelName},
  name: "${name}",
  slug: "${slug}",
  pushToPipeline: ${pushToPipeline || "null"},
  options: ${JSON.stringify(options, null, 2)},
  relationCacheTags: ${JSON.stringify(relationCacheTags, null, 2)}
};

export const create = InsertOne(config);
export const update = updateOne(config);
export const getOne = FindOne(config);
export const getAll = FindAll(config);
export const deleteItem = deleteOne(config);
`
    : `import ${modelName} from "../../database/models/${name}.model.js";
import { AsyncHandler } from "../middleware/globels/AsyncHandler.js";

export const getAll = AsyncHandler(async (req, res, next) => { message: "Get all ${name}s" });
export const getOne = AsyncHandler(async (req, res, next) => { message: "Get one ${name}" });
export const create = AsyncHandler(async (req, res, next) => { message: "Create ${name}" });
export const update = AsyncHandler(async (req, res, next) => { message: "Update ${name}" });
export const deleteItem = AsyncHandler(async (req, res, next) => { message: "Delete ${name}" });
`;

  fs.writeFileSync(controllerPath, content);
}

/**
 * Generates the route file.
 */
export const generateRouteFile = (routePath, name) => {
  const content = `import express from "express";
import * as controller from "./${name}.controller.js";
import { createValidation, deleteValidation, getOneValidation, updateValidation } from "./${name}.validation.js";
import { validation } from "../../middleware/globels/validation.js";

const router = express.Router();

router.get("/", controller.getAll);
router.get("/:id", validation(getOneValidation), controller.getOne);
router.post("/", validation(createValidation), controller.create);
router.put("/:id", validation(updateValidation), controller.update);
router.delete("/:id", validation(deleteValidation), controller.deleteItem);

export default router;
`;

  fs.writeFileSync(routePath, content);
}

/**
 * Generates the validation file.
 */
export const generateValidationFile = (validationPath) => {
  const content = `import Joi from "joi";

export const createValidation = Joi.object({});
export const updateValidation = Joi.object({});
export const deleteValidation = Joi.object({});
export const getOneValidation = Joi.object({});
`;

  fs.writeFileSync(validationPath, content);
}

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
