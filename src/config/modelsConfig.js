export const modelsConfig = [
    {
      name: "category",
      slug: "name",
      modelName: "Category",
      schemaFields: {
        name: "String",
        description: "String",
        poster: "String",
      },
      pushToPipeline: null,
      options: {
        searchFields: ["slug", "name", "description"],
      },
      relationCacheTags: ["subCategories", "products"],
      useCrudHandler: true,
    },
    {
      name: "product",
      slug: "name",
      modelName: "Product",
      schemaFields: {
        name: "String",
        price: "Number",
        category: "mongoose.Schema.Types.ObjectId",
      },
      pushToPipeline: null,
      options: {
        searchFields: ["slug", "name", "description"],
      },
      relationCacheTags: ["category", "orders"],
      useCrudHandler: true,
    },
  ];
  