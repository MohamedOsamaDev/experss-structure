import fs from "fs";
import path from "path";


/**
 * Generates the route file.
 */
export const generateRouteFile = (routePath, routeName) => {
  const content = `import express from "express";
import * as controller from "./${routeName}.controller.js";
import { ${routeName}ValidationCreate, ${routeName}ValidationDelete, ${routeName}ValidationGetOne, ${routeName}ValidationUpdate } from "./${routeName}.validation.js";
import { validation } from "../../middleware/globels/validation.js";

const ${routeName}Router = express.Router();

${routeName}Router.get("/", controller.getAll);
${routeName}Router.get("/:id", validation(${routeName}ValidationGetOne), controller.getOne);
${routeName}Router.post("/", validation(${routeName}ValidationCreate), controller.create);
${routeName}Router.put("/:id", validation(${routeName}ValidationUpdate), controller.update);
${routeName}Router.delete("/:id", validation(${routeName}ValidationDelete), controller.deleteItem);

export default ${routeName}Router;
`;

  fs.writeFileSync(routePath, content);
}