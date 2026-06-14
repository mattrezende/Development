/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("studyCycles");

  const existing = collection.fields.getByName("totalCycleDuration");
  if (existing) {
    if (existing.type === "number") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("totalCycleDuration"); // exists with wrong type, remove first
  }

  collection.fields.add(new NumberField({
    name: "totalCycleDuration",
    required: false
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("studyCycles");
  collection.fields.removeByName("totalCycleDuration");
  return app.save(collection);
})
