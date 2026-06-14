/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("flashcards");

  const existing = collection.fields.getByName("difficulty_level");
  if (existing) {
    if (existing.type === "number") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("difficulty_level"); // exists with wrong type, remove first
  }

  collection.fields.add(new NumberField({
    name: "difficulty_level",
    required: false,
    min: 1,
    max: 5
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("flashcards");
  collection.fields.removeByName("difficulty_level");
  return app.save(collection);
})
