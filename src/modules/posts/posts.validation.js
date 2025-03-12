import Joi from "joi";
import { CommonsVal, fileVal } from "../../modules/_commons/validation.js";
import { joiArray, joiText } from "../../utils/JoiHandlers.js";
import { projectValidationUpdate } from "../modules/project/project.validation.js";
import { projectValidationUpdate } from "../../modules/project/project.validation.js";

export const postsValidationCreate = () => Joi.object({
  title: joiText({ min: 2, max: 2000, required: true }),
  content: joiText({ min: 2, max: 2000, required: true }),
  publish: Joi.boolean().required(),
  date: joiText({ date: true, required: true }),
  poster: fileVal.required(),
  blogSection: Joi.object({
          title: joiText({ min: 2, max: 2000, required: true }),
description: joiText({ min: 2, max: 2000, required: true }),
projects: projectValidationUpdate(locale, false).required()
        }).required(),
  ...CommonsVal,
});

export const postsValidationUpdate = () => Joi.object({
  title: joiText({ min: 2, max: 2000, required: false }),
  content: joiText({ min: 2, max: 2000, required: false }),
  publish: Joi.boolean(),
  date: joiText({ date: true, required: false }),
  poster: fileVal.optional(),
  blogSection: Joi.object({
          title: joiText({ min: 2, max: 2000, required: true }),
description: joiText({ min: 2, max: 2000, required: true }),
projects: projectValidationUpdate(locale, false).required()
        }).optional(),
  ...CommonsVal,
});

export const postsValidationDelete = Joi.object({ id: Joi.string().required() });

export const postsValidationGetOne = Joi.object({ id: Joi.string().required() });
