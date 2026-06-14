/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("studySchedule");
  collection.fields.removeByName("updatedAt");
  return app.save(collection);
}, (app) => {

  const collection = app.findCollectionByNameOrId("studySchedule");
  collection.fields.add(new AutodateField({
    name: "updatedAt",
    onCreate: true,
    onUpdate: true
  }));
  return app.save(collection);
})
