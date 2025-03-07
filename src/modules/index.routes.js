import testRouter from "./test/test.routes.js";
import { UserRouter } from "./user/user.routes.js";
import { AuthRouter } from "./auth/auth.routes.js";
import { globalError } from "../middleware/globels/globalError.js";
import { fileRouter } from "./file/file.routes.js";
import { scheduleTasksHandler } from "../utils/scheduleTasksHandler.js";
import { globalMiddlewares, notfound, welcome } from "../config/middlewares.js";
import { scheduleTasks } from "../config/cronjob.js";
import { databaseConnection } from "../config/database.js";
import pageRouter from "./page/page.routes.js";
import webHookRouter from "./webhook/webhook.routes.js";
import { logger } from "../middleware/globels/logger.js";
export const bootstrap = (app, express) => {
  const routeverion = "/api"; // main route
  app.use(logger());
  // webhooks
  app.use(`${routeverion}/webhook`, webHookRouter);
  // global Middlewares
  globalMiddlewares.forEach((mw) => app.use(mw));
  // start  Endpoints
  app.get(routeverion, welcome);
  app.use(`${routeverion}/auth`, AuthRouter);
  app.use(`${routeverion}/users`, UserRouter);
  app.use(`${routeverion}/pages`, pageRouter);
  app.use(`${routeverion}/files`, fileRouter);
  app.use(`${routeverion}/tests`, testRouter);
  // End  Endpoints
  scheduleTasksHandler(scheduleTasks); // cron jobs
  databaseConnection(); // database connection
  app.use("*", notfound); // not found handler
  app.use(globalError); // error center
};
