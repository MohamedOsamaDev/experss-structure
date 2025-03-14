import fs from "fs";
import path from "path";
import pluralize from "pluralize";

/**
 * Generates a Mongoose model file based on a schema definition.
 * @param {string} modelPath - Path to save the model file.
 * @param {string} name - Model name.
 * @param {Object} schema - Schema definition containing fields.
 */
export const generateModelFile = (modelPath, name, schema) => {
  try {
    const { fields } = schema;

    let imports = new Set([
      `import { Schema, model, models } from "mongoose";`,
      `import { mongtext, schemaCommens, media, populateCommons, pageMetadataPopulate } from "../Commons.js";`,
    ]);

    // Function to parse each field into a Mongoose schema definition
    const parseField = (field) => {
      const { name, type, single } = field;

      const types = {
        text: "mongtext",
        textarea: "mongeDescription",
        boolean: `{ type: Boolean, default: false }`,
        date: `{ type: Date }`,
        media: single ? "media" : "[media]",
      };

      return `${name}: ${types[type] || `{ type: String }`}`;
    };

    const schemaDefinition = fields.map(parseField).join(",\n  ");

    // Collect all media fields dynamically
    const mediaFields = fields
      .filter((field) => field.type === "media")
      .map((field) => `    { path: "${field.name}", ...populateCommons }`)
      .join(",\n");

    // Construct final model file content
    const content = `${Array.from(imports).join("\n")}

const ${name}Schema = new Schema({
  slug: mongtext,
  ${schemaDefinition},
  ...schemaCommens
}, {
  timestamps: true
});

${mediaFields ? `
${name}Schema.pre(/^find/, function (next) {
  const populatePipeline = [
    pageMetadataPopulate,
${mediaFields}
  ];
  this.populate(populatePipeline);
  next();
});
` : ""}

export const ${name}Model = models.${name} || model("${name}", ${name}Schema);
`;

    // Generate the model file
    fs.writeFileSync(modelPath, content);
    console.log(`✅ Model file ${name}.js created successfully!`);
  } catch (error) {
    console.error(`❌ Error while creating ${modelPath}:`, error);
  }
};
