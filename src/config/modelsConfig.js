import project_schema from "./modules/collections/project.schema.json" with { type: "json" };
import post_schema from "./modules/collections/post.schema.json" with { type: "json" };

export const modelsConfig = [
    {
      name: "posts",
      slug: "name",
      modelName: "posts",
      schemaFields: {
        name: "String",
        description: "String",
        poster: "String",
      },
      pushToPipeline: null,
      options: {
        searchFields: ["slug", "name", "description"],
      },
      relationCacheTags: ["projects"],
      useCrudHandler: true,
      schema: post_schema
    },
    {
      name: "project",
      slug: "name",
      modelName: "project",
      schemaFields: {
        name: "String",
        price: "Number",
        category: "mongoose.Schema.Types.ObjectId",
      },
      pushToPipeline: null,
      options: {
        searchFields: ["slug", "name", "description"],
      },
      relationCacheTags: ["posts"],
      useCrudHandler: true,
      schema: project_schema
    },
  ];
  