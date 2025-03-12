import fs from "fs";
import path from "path";


/**
 * Generates the controller file.
 */
export const generateControllerFile = (
  controllerPath,
  { name, modelName, slug, pushToPipeline, options, relationCacheTags, useCrudHandler }
) => {
  const content = useCrudHandler
    ? `import { deleteOne, FindAll, FindOne, InsertOne, updateOne } from "../handlers/crudHandler.js";
import { ${modelName}Model } from "../../database/models/${name}.model.js";

const config = {
  model: ${modelName}Model,
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
    : `import { ${modelName}Model } from "../../database/models/${name}.model.js";
import { AsyncHandler } from "../middleware/globels/AsyncHandler.js";

export const getAll = AsyncHandler(async (req, res, next) => { message: "Get all ${name}s" });
export const getOne = AsyncHandler(async (req, res, next) => { message: "Get one ${name}" });
export const create = AsyncHandler(async (req, res, next) => { message: "Create ${name}" });
export const update = AsyncHandler(async (req, res, next) => { message: "Update ${name}" });
export const deleteItem = AsyncHandler(async (req, res, next) => { message: "Delete ${name}" });
`;

  fs.writeFileSync(controllerPath, content);
}