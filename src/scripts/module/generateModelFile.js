import fs from "fs";
import path from "path";


/**
 * Generates the model file.
 */
export const generateModelFile = (modelPath, { name, modelName, schemaFields }) => {
  const schemaDefinition = Object.entries(schemaFields)
    .map(([key, type]) => `${key}: { type: ${type}, required: true }`)
    .join(",\n  ");

  const content = `import mongoose from "mongoose";

const ${name}Schema = new mongoose.Schema({
  ${schemaDefinition}
}, { timestamps: true });

export const ${modelName}Model = mongoose.model("${modelName}", ${name}Schema);
`;

  fs.writeFileSync(modelPath, content);
}
