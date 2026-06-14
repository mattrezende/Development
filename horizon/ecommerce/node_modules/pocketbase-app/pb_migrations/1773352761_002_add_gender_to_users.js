/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("users");

  const existing = collection.fields.getByName("gender");
  if (existing) {
    if (existing.type === "select") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("gender"); // exists with wrong type, remove first
  }

  collection.fields.add(new SelectField({
    name: "gender",
    required: false,
    values: ["Masculino", "Feminino", "Outro", "Prefiro n\u00e3o informar"]
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("users");
  collection.fields.removeByName("gender");
  return app.save(collection);
})
