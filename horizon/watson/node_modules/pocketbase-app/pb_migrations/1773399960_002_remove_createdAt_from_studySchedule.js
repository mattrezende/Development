/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("studySchedule");
  collection.fields.removeByName("createdAt");
  return app.save(collection);
}, (app) => {

  const collection = app.findCollectionByNameOrId("studySchedule");
  collection.fields.add(new AutodateField({
    name: "createdAt",
    onCreate: true,
    onUpdate: false
  }));
  return app.save(collection);
})
