/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("flashcards");

  const existing = collection.fields.getByName("disciplineId");
  if (existing) {
    if (existing.type === "text") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("disciplineId"); // exists with wrong type, remove first
  }

  collection.fields.add(new TextField({
    name: "disciplineId",
    required: true
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("flashcards");
  collection.fields.removeByName("disciplineId");
  return app.save(collection);
})
