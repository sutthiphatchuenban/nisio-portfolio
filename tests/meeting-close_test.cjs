const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const assert = require('node:assert/strict');
const ts = require('typescript');

function load(file, requireMock, globalStore = {}) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText;
  vm.runInNewContext(code, { exports, require: requireMock, global: globalStore, console, process: { env: {} },
    setTimeout: (...args) => { const timer = setTimeout(...args); timer.unref(); return timer; }, clearTimeout });
  return exports;
}
function fixture() {
  const calls = { cleanup: 0, updates: 0 };
  const prisma = { meetingRoom: {
    findUnique: async ({ where }) => where.code === 'cold' ? { id: 'cold-id', code: 'cold', name: 'Cold room', hostName: 'Original Host', isActive: true, createdAt: new Date() } : null,
    update: async () => { calls.updates++; },
  } };
  const cloudinary = { config() {}, uploader: { destroy: async () => { calls.cleanup++; } }, api: {
    delete_resources_by_prefix: async () => { calls.cleanup++; }, delete_folder: async () => { calls.cleanup++; },
  } };
  const globalStore = {};
  const { MeetingStore } = load('lib/meeting-store.ts', name => {
    if (name === '@/lib/prisma') return { __esModule: true, default: prisma };
    if (name === '@/lib/cloudinary') return { __esModule: true, default: cloudinary };
    throw Error('Unexpected dependency: ' + name);
  }, globalStore);
  const room = { id: 'room-id', code: 'room', name: 'Test room', hostName: 'Original Host', isActive: true, createdAt: Date.now() };
  globalStore.__meetingStore.rooms.set('room', room);
  return { MeetingStore, room, calls, globalStore };
}

(async () => {
  let f = fixture();
  assert.equal((await f.MeetingStore.closeAndCleanupRoom('room', 'Visitor')).success, false);
  assert.equal((await f.MeetingStore.closeAndCleanupRoom('room', '')).success, false);
  assert.equal(f.room.isActive, true);
  assert.equal(f.calls.cleanup, 0);
  assert.equal((await f.MeetingStore.closeAndCleanupRoom('room', ' original host ')).success, true);
  assert.equal(f.room.isActive, false);
  assert.equal(f.calls.updates, 1);

  f = fixture();
  assert.equal((await f.MeetingStore.closeAndCleanupRoom('cold', 'Different Admin', true)).success, true);
  assert.equal(f.globalStore.__meetingStore.rooms.get('cold').isActive, false);
  assert.equal(f.globalStore.__meetingStore.messages.get('cold').length, 1);
  const cleaned = f.calls.cleanup;
  assert.equal((await f.MeetingStore.closeAndCleanupRoom('cold', 'Different Admin', true)).success, true);
  assert.equal(f.calls.cleanup, cleaned);
  assert.equal((await f.MeetingStore.closeAndCleanupRoom('missing', 'Admin', true)).errorCode, 'ROOM_NOT_FOUND');

  f = fixture();
  let session = null;
  const { POST } = load('app/api/meeting/room/[code]/close/route.ts', name => {
    if (name === 'next/server') return { NextResponse: { json: (body, init = {}) => ({ body, status: init.status || 200 }) } };
    if (name === '@/lib/meeting-store') return { MeetingStore: f.MeetingStore };
    if (name === 'next-auth') return { getServerSession: async () => session };
    if (name === '@/lib/auth') return { authOptions: {} };
    throw Error('Unexpected dependency: ' + name);
  });
  const close = (body, code = 'room') => POST({ json: async () => body }, { params: Promise.resolve({ code }) });
  assert.equal((await close({})).status, 400);
  assert.equal((await close({ requesterName: 'Visitor', isAdmin: true })).status, 403);
  assert.equal(f.room.isActive, true);
  session = { user: { role: 'ADMIN', name: 'Different Admin' } };
  assert.equal((await close({})).status, 200);
  assert.equal(f.room.isActive, false);
  const missing = await close({}, 'missing');
  assert.equal(missing.status, 404);
  assert.notEqual(missing.body.success, true);
  console.log('PASS: admin/host close, guest denial, cold room, idempotence, API failure status');
})().catch(error => { console.error(error); process.exitCode = 1; });
