import Joi from "joi";

// Joi Text Schema Generator
export const joiText = ({
  min = 0,
  max = 20000,
  required = false,
  date = false,
  email = false,
  url = false,
}) => {
  let joiSchema = Joi.string().trim();

  if (date) joiSchema = joiSchema.isoDate();
  if (email)
    joiSchema = joiSchema.email({ tlds: { allow: ["com", "net", "org"] } });
  if (url) joiSchema = joiSchema.uri({ scheme: ["http", "https"] });
  if (min) joiSchema = joiSchema.min(min);
  if (max) joiSchema = joiSchema.max(max);

  return required ? joiSchema.required() : joiSchema.allow("");
};

// Joi Number Schema Generator
export const joiNumber = ({
  min = 0,
  max = Infinity,
  required = false,
  integer = false,
  multiple = null,
  positive = false,
  negative = false,
  float = false,
}) => {
  let joiSchema = Joi.number().options({ convert: false });

  if (integer) joiSchema = joiSchema.integer();
  if (positive) joiSchema = joiSchema.positive();
  if (negative) joiSchema = joiSchema.negative();
  if (multiple) joiSchema = joiSchema.multiple(multiple);
  if (float) joiSchema = joiSchema.float();
  if (min) joiSchema = joiSchema.min(min);
  if (max) joiSchema = joiSchema.max(max);
  return required ? joiSchema.required() : joiSchema.allow(null);
};

// Joi Array Schema Generator
export const joiArray = ({
  min = 0,
  max = 100,
  required = false,
  body = null,
  length = null,
}) => {
  let joiSchema = Joi.array().items(body);

  if (length) joiSchema = joiSchema.length(length);
  else joiSchema = joiSchema.min(min).max(max);

  return required ? joiSchema.required() : joiSchema.allow(null);
};

// Validation Handlers
export const CreateTranslationValidation = (fields = {}) => {
  return Joi.object({
    ...fields,
    language: joiText({ min: 1, max: 255 }),
  });
};
