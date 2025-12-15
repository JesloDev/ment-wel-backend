"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const test_app_1 = require("../src/test-app");
describe('Auth - Registration and Login', () => {
    const base = '/api/v1/auth';
    it('registers a user with email successfully', async () => {
        const res = await (0, supertest_1.default)(test_app_1.expressApp)
            .post(`${base}/register`)
            .send({
            email: 'test@example.com',
            password: 'Str0ng!Pass1',
            firstName: 'Test',
            lastName: 'User',
            dateOfBirth: '1990-01-01',
            acceptTerms: 'true',
            country: 'Nigeria',
        })
            .expect(201);
        expect(res.body?.success).toBe(true);
        expect(res.body?.data?.user?.email).toBe('test@example.com');
        expect(res.body?.data?.tokens?.access?.token).toBeDefined();
        expect(res.body?.data?.tokens?.refresh?.token).toBeDefined();
    });
    it('prevents duplicate registration for same email', async () => {
        await (0, supertest_1.default)(test_app_1.expressApp).post(`${base}/register`).send({
            email: 'dupe@example.com',
            password: 'Str0ng!Pass1',
            firstName: 'Dupe',
            lastName: 'User',
            dateOfBirth: '1990-01-01',
            acceptTerms: 'true',
        });
        const res = await (0, supertest_1.default)(test_app_1.expressApp)
            .post(`${base}/register`)
            .send({
            email: 'dupe@example.com',
            password: 'Str0ng!Pass1',
            firstName: 'Dupe',
            lastName: 'User',
            dateOfBirth: '1990-01-01',
            acceptTerms: 'true',
        })
            .expect(409);
        expect(res.body?.success).toBe(false);
    });
    it('blocks login before email verification', async () => {
        await (0, supertest_1.default)(test_app_1.expressApp).post(`${base}/register`).send({
            email: 'login@example.com',
            password: 'Str0ng!Pass1',
            firstName: 'Login',
            lastName: 'User',
            dateOfBirth: '1990-01-01',
            acceptTerms: 'true',
        });
        const res = await (0, supertest_1.default)(test_app_1.expressApp)
            .post(`${base}/login`)
            .send({ email: 'login@example.com', password: 'Str0ng!Pass1' })
            .expect(403);
        expect(res.body?.success).toBe(false);
    });
});
