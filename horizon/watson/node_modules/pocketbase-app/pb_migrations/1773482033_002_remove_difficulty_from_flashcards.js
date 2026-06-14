/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("flashcards");
  collection.fields.removeByName("difficulty");
  return app.save(collection);
}, (app) => {

  const collection = app.findCollectionByNameOrId("flashcards");
  collection.fields.add(new NumberField({
    name: "difficulty",
    required: false,
    min: 1,
    max: 5
  }));
  return app.save(collection);
})
