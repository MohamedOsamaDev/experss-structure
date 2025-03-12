import Joi from "joi";
import { relationFileVal } from "../file/file.validation.js";

export const publish = Joi.boolean();

export let objectIdVal = Joi.string().hex().length(24);
export let poster = Joi.alternatives().try(objectIdVal, relationFileVal);
export const paramsIdVal = Joi.object({
  id: objectIdVal,
});

export const SmString = Joi.string().max(10000).trim();
export const LrString = Joi.string().max(20000).trim();

export const CommonsVal = {
  id: objectIdVal,
  _id: objectIdVal,
  __v: Joi.number(),
  key: Joi.string(),
  createdAt: Joi.string().isoDate(),
  createdBy: Joi.string().length(24).hex(),
  updatedAt: Joi.string().isoDate(),
  language: Joi.string(),
  publish: Joi.boolean(),
};

export const fileVal = Joi.alternatives().try(
  objectIdVal,
  Joi.object({
    _id: Joi.string().hex().length(24),
    filename: Joi.string(),
    public_id: Joi.string(),
    thumbnail: Joi.string(),
    filename: Joi.string(),
    url: Joi.string(),
    mimetype: Joi.string(),
    size: Joi.number(),
  })
);