/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("flashcards");
  collection.fields.removeByName("topic");
  return app.save(collection);
}, (app) => {

  const collection = app.findCollectionByNameOrId("flashcards");
  collection.fields.add(new TextField({
    name: "topic",
    required: true
  }));
  return app.save(collection);
})
