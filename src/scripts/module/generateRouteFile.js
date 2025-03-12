import fs from "fs";
import path from "path";


/**
 * Generates the route file.
 */
export const generateRouteFile = (routePath, routeName) => {
  const content = `import express from "express";
import * as controller from "./${routeName}.controller.js";
import { create${routeName}Validation, delete${routeName}Validation, getOne${routeName}Validation, update${routeName}Validation } from "./${routeName}.validation.js";
import { validation } from "../../middleware/globels/validation.js";

const ${routeName}Router = express.Router();

${routeName}Router.get("/", controller.getAll);
${routeName}Router.get("/:id", validation(getOne${routeName}Validation), controller.getOne);
${routeName}Router.post("/", validation(create${routeName}Validation), controller.create);
${routeName}Router.put("/:id", validation(update${routeName}Validation), controller.update);
${routeName}Router.delete("/:id", validation(delete${routeName}Validation), controller.deleteItem);

export default ${routeName}Router;
`;

  fs.writeFileSync(routePath, content);
}