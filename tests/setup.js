"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
let mongo;
beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.CLIENT_URL = 'http://localhost:3000';
    process.env.SERVER_URL = 'http://localhost:5000';
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_ACCESS_EXPIRATION = '15m';
    process.env.JWT_REFRESH_EXPIRATION = '7d';
    process.env.RECAPTCHA_SECRET = '';
    mongo = await mongodb_memory_server_1.MongoMemoryServer.create();
    const uri = mongo.getUri();
    await mongoose_1.default.connect(uri);
});
afterAll(async () => {
    try {
        if (mongoose_1.default.connection.readyState !== 0) {
            await mongoose_1.default.connection.dropDatabase();
            await mongoose_1.default.connection.close();
        }
    }
    finally {
        if (mongo)
            await mongo.stop();
    }
});
afterEach(async () => {
    if (mongoose_1.default.connection.readyState !== 1)
        return; // not connected
    const db = mongoose_1.default.connection.db;
    if (!db)
        return;
    const collections = await db.collections();
    await Promise.all(collections.map((c) => c.deleteMany({})));
});
