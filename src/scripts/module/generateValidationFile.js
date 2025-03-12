import fs from "fs";
import path from "path";
import pluralize from "pluralize";

/**
 * Generates a Joi validation file based on a schema definition.
 * @param {string} validationPath - Path to save the validation file.
 * @param {string} schemaName - Name of the schema.
 * @param {Object} schema - Schema definition containing fields.
 */
export const generateValidationFile = (validationPath, schemaName, schema) => {
  try {
    let imports = `import Joi from "joi";
import { CommonsVal, fileVal } from "../../modules/_commons/validation.js";
import { joiArray, joiText, joiObject } from "../../utils/JoiHandlers.js";\n`;

    // Function to parse each field into a Joi validation schema
    const parseField = (field, required = false) => {
      const {
        name,
        type = "text",
        min = 2,
        max = 2000,
        single,
        ref,
        fields,
      } = field;
      const isRequired = required ? `true` : `false`;

      const text = () =>
        `joiText({ min: ${min}, max: ${max}, required: ${isRequired} })`;

      const media = () => {
        const fileValSchema = `fileVal.${
          required ? "required()" : "optional()"
        }`;
        return single
          ? `${fileValSchema}`
          : `joiArray({ body: ${fileValSchema}, min: ${min}, max: ${max}, required: ${isRequired} })`;
      };

      const boolean = () => `Joi.boolean()${required ? ".required()" : ""}`;

      const date = () => `joiText({ date: true, required: ${isRequired} })`;

      const object = () => {
        if (!fields) return "Joi.object().optional()";
        return `joiObject({
          body: { 
            ${fields.map((f) => `${f.name}: ${parseField(f)}`).join(",\n")}
          },
          locale,
          ${isRequired ? "isRequired: true" : ""}
        })`;
      };

      const relation = () => {
        if (!ref) return null;
        const refKey = pluralize.singular(ref);
        const relationSchema = `${refKey}Validation`;
        imports += `import { ${relationSchema} } from "../modules/${refKey}/${refKey}.validation";\n`;

        return single
          ? `${relationSchema}(locale, false)${required ? ".required()" : ""}`
          : `joiArray({ body: ${relationSchema}(locale, true), locale, ${[
              min && `min: ${min}`,
              required && `required: ${isRequired}`,
            ]
              .filter(Boolean)
              .join(", ")} })`;
      };

      const allTypes = {
        text,
        textarea: text,
        date,
        boolean,
        media,
        object,
        relation,
      };
      return allTypes[type] ? allTypes[type]() : null;
    };

    // Create different validation schemas
    const createBody = schema.fields
      .map((field) => `${field.name}: ${parseField(field, true)},`)
      .filter(Boolean)
      .join("\n  ");

    const updateBody = schema.fields
      .map((field) => `${field.name}: ${parseField(field, false)},`)
      .filter(Boolean)
      .join("\n  ");

    const idValidation = `Joi.object({ id: Joi.string().required() })`;

    const result = `${imports}
export const create${schemaName}Validation = (locale = "en") => Joi.object({
  ${createBody}
  ...CommonsVal,
});

export const update${schemaName}Validation = (locale = "en") => Joi.object({
  ${updateBody}
  ...CommonsVal,
});

export const delete${schemaName}Validation = ${idValidation};

export const getOne${schemaName}Validation = ${idValidation};
`;

    // Generate validation file content
    fs.writeFileSync(validationPath, result);
    console.log(`✅ Validation file ${schemaName} created successfully!`);
  } catch (error) {
    console.error(
      `❌ Error while creating ${schemaName}.validation.js file:`,
      error
    );
    return null;
  }
};
