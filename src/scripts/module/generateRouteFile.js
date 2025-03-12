import fs from "fs";
import path from "path";


/**
 * Generates the route file.
 */
export const generateRouteFile = (routePath, routeName) => {
  const content = `import express from "express";
import * as controller from "./${routeName}.controller.js";
import { createValidation, deleteValidation, getOneValidation, updateValidation } from "./${routeName}.validation.js";
import { validation } from "../../middleware/globels/validation.js";

const ${routeName}Router = express.Router();

${routeName}Router.get("/", controller.getAll);
${routeName}Router.get("/:id", validation(getOneValidation), controller.getOne);
${routeName}Router.post("/", validation(createValidation), controller.create);
${routeName}Router.put("/:id", validation(updateValidation), controller.update);
${routeName}Router.delete("/:id", validation(deleteValidation), controller.deleteItem);

export default ${routeName}Router;
`;

  fs.writeFileSync(routePath, content);
}