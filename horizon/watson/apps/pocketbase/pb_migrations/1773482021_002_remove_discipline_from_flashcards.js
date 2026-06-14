/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("flashcards");
  collection.fields.removeByName("discipline");
  return app.save(collection);
}, (app) => {

  const collection = app.findCollectionByNameOrId("flashcards");
  collection.fields.add(new TextField({
    name: "discipline",
    required: true
  }));
  return app.save(collection);
})
