/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("flashcards");
  collection.fields.removeByName("reviewCount");
  return app.save(collection);
}, (app) => {

  const collection = app.findCollectionByNameOrId("flashcards");
  collection.fields.add(new NumberField({
    name: "reviewCount",
    required: false
  }));
  return app.save(collection);
})
