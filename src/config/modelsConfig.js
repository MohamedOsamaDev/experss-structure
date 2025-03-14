import project_schema from "./modules/collections/project.schema.json" with { type: "json" };
import post_schema from "./modules/collections/post.schema.json" with { type: "json" };

export const modelsConfig = [
    {
      name: "posts",
      slug: "name",
      modelName: "posts",
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
      pushToPipeline: null,
      options: {
        searchFields: ["slug", "name", "description"],
      },
      relationCacheTags: ["posts"],
      useCrudHandler: true,
      schema: project_schema
    },
  ];
  