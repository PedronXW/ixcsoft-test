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

// src/infra/http/routes/message.ts
var message_exports = {};
__export(message_exports, {
  messageRouter: () => messageRouter
});
module.exports = __toCommonJS(message_exports);
var import_express = require("express");

// src/@shared/either.ts
var Right = class {
  constructor(value) {
    this.value = value;
  }
  isRight() {
    return true;
  }
  isLeft() {
    return false;
  }
};
var right = (value) => {
  return new Right(value);
};

// src/domain/application/services/message/get-messages.ts
var GetMessagesService = class {
  constructor(messageRepository2) {
    this.messageRepository = messageRepository2;
  }
  async execute({
    query
  }) {
    const message = await this.messageRepository.getMessages(query);
    return right(message);
  }
};

// src/infra/database/mongo-connection.ts
var import_mongodb = require("mongodb");

// src/infra/env/index.ts
var import_config = require("dotenv/config");
var import_zod = require("zod");

// src/infra/http/errors/AppError.ts
var AppError = class {
  constructor(message, statusCode = 400) {
    this.message = message;
    this.statusCode = statusCode;
  }
};

// src/infra/env/index.ts
var envSchema = import_zod.z.object({
  NODE_ENV: import_zod.z.enum(["development", "production", "test"]).default("development"),
  PORT: import_zod.z.coerce.number().default(3333),
  MONGO_URL_PRODUCTION: import_zod.z.string().url(),
  MONGO_URL_DEVELOPMENT: import_zod.z.string().url(),
  JWT_SECRET: import_zod.z.string()
});
var _env = envSchema.safeParse(process.env);
if (!_env.success) {
  console.error("Invalid environment variables:", _env.error.format());
  throw new AppError(_env.error.message);
}
var env = _env.data;

// src/infra/database/mongo-connection.ts
var MongoConnection = class {
  constructor() {
    this.client = new import_mongodb.MongoClient(
      env.NODE_ENV === "production" ? env.MONGO_URL_PRODUCTION : env.MONGO_URL_DEVELOPMENT
    );
    this.connect();
  }
  async connect() {
    await this.client.connect();
  }
  async disconnect() {
    await this.client.close();
  }
  async createCollection(dbName, collectionName) {
    const database = this.client.db(dbName);
    const newCollection = await database.createCollection(collectionName);
    return newCollection;
  }
  async getDatabase(dbName) {
    const database = this.client.db(dbName);
    return database;
  }
  getCollection(dbName, collectionName) {
    const database = this.client.db(dbName);
    const collection = database.collection(collectionName);
    return collection;
  }
};

// src/@shared/entities/entity-id.ts
var import_crypto = require("crypto");
var EntityId = class {
  constructor(value) {
    this.value = value ?? (0, import_crypto.randomUUID)();
  }
  getValue() {
    return this.value;
  }
  equals(id) {
    if (id === null || id === void 0) {
      return false;
    }
    if (!(id instanceof this.constructor)) {
      return false;
    }
    if (id === this) {
      return true;
    }
    return this.getValue() === id.value;
  }
};

// src/@shared/entities/entity.ts
var Entity = class {
  get id() {
    return this._id;
  }
  constructor(props, id) {
    this._id = id ?? new EntityId();
    this.props = props;
  }
  equals(entity) {
    if (entity === null || entity === void 0) {
      return false;
    }
    if (!(entity instanceof this.constructor)) {
      return false;
    }
    if (entity === this) {
      return true;
    }
    return this._id.equals(entity._id);
  }
};

// src/domain/enterprise/entities/message.ts
var Message = class _Message extends Entity {
  get creatorId() {
    return this.props.creatorId;
  }
  get creatorName() {
    return this.props.creatorName;
  }
  get text() {
    return this.props.text;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }
  static create(props, id) {
    const message = new _Message(
      {
        ...props,
        createdAt: props.createdAt ?? /* @__PURE__ */ new Date()
      },
      id
    );
    return message;
  }
};

// src/infra/database/mappers/message-mapper.ts
var MessageMapper = class {
  static toPersistence(message) {
    return {
      id: message.id.getValue(),
      text: message.text,
      creatorId: message.creatorId.getValue(),
      creatorName: message.creatorName,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt
    };
  }
  static toDomain(message) {
    const newMessage = Message.create(
      {
        text: message.text,
        creatorId: new EntityId(message.creatorId),
        creatorName: message.creatorName,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt
      },
      new EntityId(message.id)
    );
    return newMessage;
  }
};

// src/infra/database/repositories/MongoMessageRepository.ts
var MongoMessageRepository = class {
  constructor(mongoConnection2) {
    this.mongoConnection = mongoConnection2;
  }
  async createMessage(message) {
    const collection = this.mongoConnection.getCollection(
      "teste",
      env.NODE_ENV === "test" ? "teste_" + process.env.COLLECTION_ID : "messages"
    );
    await collection.insertOne(MessageMapper.toPersistence(message));
    return message;
  }
  async getMessages({ page, limit }) {
    const collection = this.mongoConnection.getCollection(
      "teste",
      env.NODE_ENV === "test" ? "teste_" + process.env.COLLECTION_ID : "messages"
    );
    const options = {
      limit,
      skip: limit * page,
      sort: ["createdAt", "desc"]
    };
    const count = await collection.countDocuments();
    const messages = (await collection.find({}, options).toArray()).map(
      MessageMapper.toDomain
    );
    return {
      messages,
      count
    };
  }
};

// src/infra/services/message/get-messages/index.ts
var mongoConnection = new MongoConnection();
var messageRepository = new MongoMessageRepository(mongoConnection);
var getMessagesService = new GetMessagesService(messageRepository);

// src/infra/http/presenters/presenter-message.ts
var MessagePresenter = class {
  static toHTTP(message) {
    return {
      id: message.id.getValue(),
      text: message.text,
      creatorName: message.creatorName,
      creatorId: message.creatorId.getValue(),
      createdAt: message.createdAt,
      updatedAt: message.updatedAt
    };
  }
};

// src/infra/http/controllers/message/get-messages/get-messages.ts
var import_zod2 = require("zod");
var getMessagesQueryZodSchema = import_zod2.z.object({
  page: import_zod2.z.string().optional().default("0"),
  limit: import_zod2.z.string().optional().default("10")
});
var GetMessagesController = class {
  constructor(fetchMessagesByChatService) {
    this.fetchMessagesByChatService = fetchMessagesByChatService;
  }
  async handle(req, res) {
    const { page, limit } = getMessagesQueryZodSchema.parse(req.query);
    const messages = await this.fetchMessagesByChatService.execute({
      query: {
        page: Number(page),
        limit: Number(limit)
      }
    });
    if (messages.isLeft()) {
      return res.status(404).send({ error: messages.value.message });
    }
    return res.status(200).send({
      messages: messages.value.messages.map(MessagePresenter.toHTTP),
      count: messages.value.count
    });
  }
};

// src/infra/http/controllers/message/get-messages/index.ts
var getMessagesController = new GetMessagesController(getMessagesService);

// src/infra/http/middlewares/verifyAuthentication.ts
var import_jsonwebtoken = require("jsonwebtoken");

// src/domain/enterprise/entities/client.ts
var Client = class _Client extends Entity {
  get name() {
    return this.props.name;
  }
  set name(name) {
    this.props.name = name;
  }
  get status() {
    return this.props.status;
  }
  set status(status) {
    this.props.status = status;
  }
  get email() {
    return this.props.email;
  }
  set email(email) {
    this.props.email = email;
  }
  get password() {
    return this.props.password;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }
  static create(props, id) {
    const client = new _Client(
      {
        ...props,
        status: props.status ?? "offline",
        createdAt: props.createdAt ?? /* @__PURE__ */ new Date()
      },
      id
    );
    return client;
  }
};

// src/infra/database/mappers/client-mapper.ts
var ClientMapper = class {
  static toDomain(raw) {
    return Client.create(
      {
        name: raw.name,
        email: raw.email,
        password: raw.password,
        status: raw.status,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt
      },
      new EntityId(raw.id)
    );
  }
  static toPersistence(Client2) {
    return {
      id: Client2.id.getValue(),
      name: Client2.name,
      email: Client2.email,
      status: Client2.status,
      password: Client2.password,
      createdAt: Client2.createdAt,
      updatedAt: Client2.updatedAt
    };
  }
};

// src/infra/database/repositories/MongoClientRepository.ts
var MongoClientRepository = class {
  constructor(mongoConnection2) {
    this.mongoConnection = mongoConnection2;
  }
  async createClient(client) {
    const collection = this.mongoConnection.getCollection(
      "teste",
      env.NODE_ENV === "test" ? "teste_" + process.env.COLLECTION_ID : "clients"
    );
    await collection.insertOne(ClientMapper.toPersistence(client));
    return client;
  }
  async deleteClient(id) {
    const collection = this.mongoConnection.getCollection(
      "teste",
      env.NODE_ENV === "test" ? "teste_" + process.env.COLLECTION_ID : "clients"
    );
    const deleteResult = await collection.deleteOne({ id });
    return deleteResult.deletedCount === 1;
  }
  async editClient(id, { name, email }) {
    const collection = this.mongoConnection.getCollection(
      "teste",
      env.NODE_ENV === "test" ? "teste_" + process.env.COLLECTION_ID : "clients"
    );
    const newClient = collection.updateOne(
      { id },
      {
        $set: {
          name,
          email
        }
      }
    );
    return ClientMapper.toDomain(newClient);
  }
  async getClientByEmail(email) {
    const collection = this.mongoConnection.getCollection(
      "teste",
      env.NODE_ENV === "test" ? "teste_" + process.env.COLLECTION_ID : "clients"
    );
    const client = await collection.findOne({ email });
    if (!client) {
      return null;
    }
    return ClientMapper.toDomain(client);
  }
  async getClientById(id) {
    const collection = this.mongoConnection.getCollection(
      "teste",
      env.NODE_ENV === "test" ? "teste_" + process.env.COLLECTION_ID : "clients"
    );
    const client = await collection.findOne({ id });
    if (!client) {
      return null;
    }
    return ClientMapper.toDomain(client);
  }
  async getAllClients() {
    const collection = this.mongoConnection.getCollection(
      "teste",
      env.NODE_ENV === "test" ? "teste_" + process.env.COLLECTION_ID : "clients"
    );
    const clients = await collection.find().toArray();
    return clients.map((client) => ClientMapper.toDomain(client));
  }
  async changeStatus(id, status) {
    const collection = this.mongoConnection.getCollection(
      "teste",
      env.NODE_ENV === "test" ? "teste_" + process.env.COLLECTION_ID : "clients"
    );
    await collection.updateOne(
      { id },
      {
        $set: {
          status
        }
      }
    );
    const client = await collection.findOne({ id });
    return ClientMapper.toDomain(client);
  }
};

// src/infra/http/middlewares/verifyAuthentication.ts
async function verifyAuthentication(request, response, next) {
  const authHeader = request.headers.authorization;
  if (!authHeader) {
    throw new AppError("Token missing", 401);
  }
  const [, token] = authHeader.split(" ");
  try {
    const { sub: id } = (0, import_jsonwebtoken.verify)(token, env.JWT_SECRET);
    const mongoConnection2 = new MongoConnection();
    const developersRepository = new MongoClientRepository(mongoConnection2);
    const user = developersRepository.getClientById(id);
    if (!user) {
      throw new AppError("User does not exists", 401);
    }
    request.user = {
      id
    };
    next();
  } catch (error) {
    throw new AppError("Invalid token", 401);
  }
}

// src/infra/http/routes/message.ts
var messageRouter = (0, import_express.Router)();
messageRouter.get("/", verifyAuthentication, (request, response) => {
  return getMessagesController.handle(request, response);
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  messageRouter
});
