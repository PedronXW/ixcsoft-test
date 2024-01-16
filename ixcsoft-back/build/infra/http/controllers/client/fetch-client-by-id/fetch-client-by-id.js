"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/infra/http/controllers/client/fetch-client-by-id/fetch-client-by-id.ts
var fetch_client_by_id_exports = {};
__export(fetch_client_by_id_exports, {
  FetchClientByIdController: () => FetchClientByIdController
});
module.exports = __toCommonJS(fetch_client_by_id_exports);

// src/infra/http/presenters/presenter-client.ts
var ClientPresenter = class {
  static toHTTP(client) {
    return {
      id: client.id.getValue(),
      name: client.name,
      email: client.email,
      status: client.status,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt
    };
  }
};

// src/infra/http/controllers/client/fetch-client-by-id/fetch-client-by-id.ts
var import_zod = require("zod");
var fetchClientByIdZodSchema = import_zod.z.object({
  id: import_zod.z.string().uuid()
});
var FetchClientByIdController = class {
  constructor(fetchClientByIdService) {
    this.fetchClientByIdService = fetchClientByIdService;
  }
  async handle(req, res) {
    const { id } = fetchClientByIdZodSchema.parse(req.params);
    const client = await this.fetchClientByIdService.execute({ id });
    if (client.isLeft()) {
      return res.status(404).send({ error: client.value.message });
    }
    return res.status(200).send({ client: ClientPresenter.toHTTP(client.value) });
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  FetchClientByIdController
});
