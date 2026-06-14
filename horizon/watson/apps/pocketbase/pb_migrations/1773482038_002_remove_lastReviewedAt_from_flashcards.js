/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("flashcards");
  collection.fields.removeByName("lastReviewedAt");
  return app.save(collection);
}, (app) => {

  const collection = app.findCollectionByNameOrId("flashcards");
  collection.fields.add(new DateField({
    name: "lastReviewedAt",
    required: false
  }));
  return app.save(collection);
})
