/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("orders");
  collection.listRule = "userId = @request.auth.id || @request.auth.role = 'admin'";
  collection.viewRule = "userId = @request.auth.id || @request.auth.role = 'admin'";
  collection.createRule = "@request.auth.id != \"\"";
  collection.updateRule = "@request.auth.role = 'admin'";
  collection.deleteRule = "@request.auth.id != \"\"";
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("orders");
  collection.listRule = "userId = @request.auth.id";
  collection.viewRule = "userId = @request.auth.id";
  collection.createRule = "@request.auth.id != \"\"";
  collection.updateRule = "@request.auth.role = 'admin'";
  collection.deleteRule = "@request.auth.id != \"\"";
  return app.save(collection);
})
