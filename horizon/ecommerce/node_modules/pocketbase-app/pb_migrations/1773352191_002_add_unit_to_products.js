/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("products");

  const existing = collection.fields.getByName("unit");
  if (existing) {
    if (existing.type === "select") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("unit"); // exists with wrong type, remove first
  }

  collection.fields.add(new SelectField({
    name: "unit",
    required: true,
    values: ["g", "kg", "ml", "l", "un"]
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("products");
  collection.fields.removeByName("unit");
  return app.save(collection);
})
