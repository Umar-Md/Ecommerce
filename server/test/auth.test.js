const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../src/models/User');
const auth = require('../src/controllers/auth');
const { normalizePhone } = require('../src/utils/phone');
const response = () => ({ code: 200, status(code) { this.code = code; return this; }, json(data) { this.data = data; return this; } });
const next = (error) => { throw error; };
const body = { name: 'Customer', email: 'Customer@Example.com', phone: '+91 98765 43210', password: 'Password123' };

test('mobile formats normalize to one identity and malformed values are rejected', () => {
  for (const value of ['9876543210', '+91 98765 43210', '919876543210', '09876543210']) assert.equal(normalizePhone(value), '9876543210');
  for (const value of ['', undefined, {}, '1234567890', '987654321', '+1 9876543210', '98765abc43210']) assert.equal(normalizePhone(value), null);
  assert.ok(User.schema.indexes().some(([keys, options]) => keys.phone === 1 && options.unique && options.partialFilterExpression));
});

test('registration requires mobile number', async () => {
  const res = response();
  await auth.register({ body: { ...body, phone: '' } }, res, next);
  assert.equal(res.code, 422);
});

test('registration rejects duplicate email or normalized mobile number', async (t) => {
  for (const field of ['email', 'phone']) await t.test(field, async (t) => {
    t.mock.method(User, 'exists', async (query) => query[field] ? { _id: 'existing' } : null);
    const create = t.mock.method(User, 'create', async () => { throw Error('Must not create'); });
    const res = response();
    await auth.register({ body }, res, next);
    assert.equal(res.code, 409);
    assert.equal(create.mock.callCount(), 0);
  });
});

test('registration persists normalized mobile and hashed password', async (t) => {
  t.mock.method(User, 'exists', async () => null);
  t.mock.method(bcrypt, 'hash', async () => 'hashed-password');
  t.mock.method(jwt, 'sign', () => 'token');
  t.mock.method(User, 'create', async (data) => {
    assert.equal(data.email, 'customer@example.com');
    assert.equal(data.phone, '9876543210');
    assert.equal(data.password, 'hashed-password');
    return { ...data, _id: 'user-id' };
  });
  const res = response();
  await auth.register({ body }, res, next);
  assert.equal(res.code, 201);
  assert.equal(res.data.user.phone, '9876543210');
  assert.equal(res.data.user.password, undefined);
});

test('concurrent duplicate registration returns conflict', async (t) => {
  t.mock.method(User, 'exists', async () => null);
  t.mock.method(bcrypt, 'hash', async () => 'hash');
  t.mock.method(User, 'create', async () => { throw { code: 11000, keyPattern: { phone: 1 } }; });
  const res = response();
  await auth.register({ body }, res, next);
  assert.equal(res.code, 409);
  assert.match(res.data.message, /Mobile/);
});

test('login accepts mobile, email, and legacy email payload', async (t) => {
  for (const input of [{ identifier: '+91 9876543210' }, { identifier: 'CUSTOMER@example.com' }, { email: 'CUSTOMER@example.com' }]) await t.test(JSON.stringify(input), async (t) => {
    t.mock.method(User, 'findOne', async (query) => {
      assert.deepEqual(query, input.identifier?.startsWith('+') ? { phone: '9876543210' } : { email: 'customer@example.com' });
      return { _id: 'id', isActive: true, password: 'hash' };
    });
    t.mock.method(bcrypt, 'compare', async (password, hash) => password === body.password && hash === 'hash');
    t.mock.method(jwt, 'sign', () => 'token');
    const res = response();
    await auth.login({ body: { ...input, password: body.password } }, res, next);
    assert.equal(res.code, 200);
    assert.equal(res.data.token, 'token');
  });
});

test('login rejects missing users, inactive users, and wrong passwords', async (t) => {
  for (const user of [null, { isActive: false }, { isActive: true, password: 'hash' }]) await t.test(JSON.stringify(user), async (t) => {
    t.mock.method(User, 'findOne', async () => user);
    t.mock.method(bcrypt, 'compare', async () => false);
    const res = response();
    await auth.login({ body: { identifier: body.phone, password: 'wrong' } }, res, next);
    assert.equal(res.code, 401);
    assert.equal(res.data.token, undefined);
  });
});
