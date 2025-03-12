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
    let imports = new Set([
      `import Joi from "joi";`,
      `import { CommonsVal, fileVal } from "../../modules/_commons/validation.js";`,
      `import { joiArray, joiText } from "../../utils/JoiHandlers.js";`,
    ]);

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
      const isRequired = required ? `.required()` : "";

      const text = () =>
        `joiText({ min: ${min}, max: ${max}, required: ${required} })`;

      const media = () => {
        const fileValSchema = `fileVal${isRequired}`;
        return single
          ? `${fileValSchema}`
          : `Joi.array().items(${fileValSchema}).min(${min}).max(${max})${isRequired}`;
      };

      const boolean = () => `Joi.boolean()${isRequired}`;

      const date = () => `joiText({ date: true, required: ${required} })`;

      const object = () => {
        if (!fields) return "Joi.object().optional()";
        return `Joi.object({
          ${fields.map((f) => `${f.name}: ${parseField(f, true)}`).join(",\n")}
            ...CommonsVal,
        })${isRequired}`;
      };

      const relation = () => {
        if (!ref) return null;
        const refKey = pluralize.singular(ref);
        const relationSchema = `${refKey}ValidationUpdate`;

        // Prevent duplicate imports
        const importStatement = `import { ${relationSchema} } from "../../modules/${refKey}/${refKey}.validation.js";`;
        imports.add(importStatement);

        return single
          ? `${relationSchema}().min(1)${isRequired},`
          : `Joi.array().items(${relationSchema}().min(1))${isRequired},`;
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

    const result = `${Array.from(imports).join("\n")}

export const ${schemaName}ValidationCreate = () => Joi.object({
  ${createBody}
  ...CommonsVal,
});

export const ${schemaName}ValidationUpdate = () => Joi.object({
  ${updateBody}
  ...CommonsVal,
});

export const ${schemaName}ValidationDelete = ${idValidation};

export const ${schemaName}ValidationGetOne = ${idValidation};
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
