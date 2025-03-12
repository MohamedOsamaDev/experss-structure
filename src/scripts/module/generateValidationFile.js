import fs from "fs";
import path from "path";

/**
 * Generates a Joi validation file based on a schema definition.
 * @param {string} validationPath - Path to save the validation file.
 * @param {string} schemaName - Name of the schema.
 * @param {Object} schema - Schema definition containing fields.
 */
export const generateValidationFile = (validationPath, schemaName, schema) => {
  try {
    // Import dependencies
    let imports = `import Joi from "joi";
import { CommonsVal, fileVal } from "../../modules/_commons/validation.js";
import { joiArray, joiText, messagesHandlers } from "../../utils/JoiHandlers.js";\n`;

    // Function to parse each field into a Joi validation schema
    const parseField = (field) => {
      const { name, type, required = false, min, max, single } = field;
      const minValue = min || undefined;
      const isRequired = required ? `true` : `false`;

      const text = () =>
        `joiText({ min: ${minValue}, max: ${max}, required: ${isRequired} })`;

      const media = () => {
        const fileValSchema = `fileVal.${
          required ? "required()" : "optional()"
        }`;
        return single
          ? `${fileValSchema}.messages(messagesHandlers({ label: "${name}", type: "object" }))`
          : `joiArray({ body: ${fileValSchema}.messages(messagesHandlers({ label: "${name}", type: "object" })), min: ${minValue}, max: ${max}, required: ${isRequired} })`;
      };

      const boolean = () =>
        `Joi.boolean().messages(messagesHandlers({ label: "${name}", type: "boolean" }))${
          required ? ".required()" : ""
        }`;

      const date = () => `joiText({ date: true, required: ${isRequired} })`;

      const object = () =>
        `Joi.object({ ...commonVal }).messages(messagesHandlers({ label: "${name}", type: "object" }))`;

      const allTypes = {
        text,
        textarea: text,
        date,
        boolean,
        media,
        object,
      };

      return allTypes[type] ? allTypes[type]() : null;
    };

    // Construct validation schema
    const bodyContent = schema.fields
      .map((field) => `${field.name}: ${parseField(field)},`)
      .filter(Boolean)
      .join("\n  ");

    const result = `${imports}
export const ${schemaName}Validation = (locale = "en") => Joi.object({
  ${bodyContent}
  ...CommonsVal,
});
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
