/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const employeesCollection = app.findCollectionByNameOrId("employees");
  const collection = app.findCollectionByNameOrId("users");

  const existing = collection.fields.getByName("employee_id");
  if (existing) {
    if (existing.type === "relation") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("employee_id"); // exists with wrong type, remove first
  }

  collection.fields.add(new RelationField({
    name: "employee_id",
    required: false,
    collectionId: employeesCollection.id
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("users");
  collection.fields.removeByName("employee_id");
  return app.save(collection);
})
