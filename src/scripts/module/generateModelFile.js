import fs from "fs";
import path from "path";
import pluralize from "pluralize";

/**
 * Generates a Mongoose model file based on a schema definition.
 * @param {string} modelPath - Path to save the model file.
 * @param {Object} schema - Schema definition containing fields and options.
 */
export const generateModelFile = (modelPath, schema) => {
  try {
    const { fields } = schema;
    const schemaName = pluralize.singular(modelPath.split("/").pop().replace(".js", ""));
    const modelName = schemaName.charAt(0).toUpperCase() + schemaName.slice(1);

    let imports = new Set([
      `import { Schema, model, models } from "mongoose";`,
      `import { mongtext, schemaCommens, poster, mongeDescription } from "../Commons";`
    ]);

    // Function to parse each field into a Mongoose schema definition
    const parseField = (field) => {
      const { name, type, single } = field;

      const types = {
        text: "mongtext",
        textarea: "mongeDescription",
        boolean: `{ type: Boolean, default: false }`,
        date: `{ type: Date }`,
        media: single ? "poster" : "[poster]",
      };

      return `${name}: ${types[type] || `{ type: String }`}`;
    };

    const schemaDefinition = fields.map(parseField).join(",\n  ");

    // Construct final model file content
    const content = `${Array.from(imports).join("\n")}

const ${modelName}Schema = new Schema({
  slug: mongtext,
  ${schemaDefinition},
  ...schemaCommens
}, {
  timestamps: true
});

export const ${modelName} = models.${modelName} || model("${modelName}", ${modelName}Schema);
`;

    // Generate the model file
    fs.writeFileSync(modelPath, content);
    console.log(`✅ Model file ${modelName}.js created successfully!`);
  } catch (error) {
    console.error(`❌ Error while creating ${modelPath}:`, error);
  }
};
