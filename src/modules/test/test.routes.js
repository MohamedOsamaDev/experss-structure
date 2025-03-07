import express from "express";
import * as controller from "./test.controller.js";
import {
  createValidation,
  deleteValidation,
  getOneValidation,
  updateValidation,
} from "./test.validation.js";
import { validation } from "../../middleware/globels/validation.js";

const router = express.Router();
// (route) get all tests
router.get("/", controller.getAll);
// (route) get one test
router.get("/:id", validation(getOneValidation), controller.getOne);
// (route) create one test
router.post("/", validation(createValidation), controller.create);
// (route) update one test
router.put("/:id", validation(updateValidation), controller.update);
// (route) delete one test
router.delete("/:id", validation(deleteValidation), controller.deleteItem);

export default router;
        
