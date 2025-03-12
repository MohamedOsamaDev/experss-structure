import fs from "fs";
import path from "path";


/**
 * Generates the validation file.
 */
export const generateValidationFile = (validationPath) => {
  const content = `import Joi from "joi";

export const createValidation = Joi.object({});
export const updateValidation = Joi.object({});
export const deleteValidation = Joi.object({});
export const getOneValidation = Joi.object({});
`;

  fs.writeFileSync(validationPath, content);
}
