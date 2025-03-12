// landing create
import Joi from "joi";
import { relationFileVal } from "../file/file.validation.js";

import { CommonsVal, LrString, objectIdVal, SmString } from "../_commons/validation.js";

let poster = Joi.alternatives().try(objectIdVal, relationFileVal);
export const pageMetadataVal = Joi.object({
  title: SmString.optional().allow(""),
  description: LrString.optional().allow(""),
  keywords: Joi.array().items(SmString.optional().allow("")).optional(),
  images: Joi.array().items(poster.allow(null)).optional(),
  ...CommonsVal
}).optional();

// Validation for landing
export const landingCreateVal = Joi.object({
  pageMetadata:pageMetadataVal,
  title: Joi.string().trim().required(),
  description: Joi.string().trim().required(),

  ...CommonsVal,
});
export const landingUpdateVal = Joi.object({
  pageMetadata:pageMetadataVal,
  title: Joi.string().trim(),
  description: Joi.string().trim(),

  ...CommonsVal,
});