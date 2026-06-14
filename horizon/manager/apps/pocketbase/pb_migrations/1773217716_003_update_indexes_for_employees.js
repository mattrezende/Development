/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("employees");
  collection.indexes.push("CREATE UNIQUE INDEX idx_employees_cpf ON employees (cpf)");
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("employees");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_employees_cpf"));
  return app.save(collection);
})
