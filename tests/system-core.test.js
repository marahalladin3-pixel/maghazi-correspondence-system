import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { describe, it } from 'vitest';

describe('مسار المراسلة الأساسي', () => {
  it('ينقل المراسلة عبر التدقيق والاعتماد والتمديد', () => {
    const store = new Map();
    globalThis.localStorage = {
      getItem: (key) => store.has(key) ? store.get(key) : null,
      setItem: (key, value) => store.set(key, String(value)),
      removeItem: (key) => store.delete(key),
      clear: () => store.clear(),
      key: (index) => [...store.keys()][index] || null,
      get length() { return store.size; },
    };
    globalThis.window = globalThis;
    const source = fs.readFileSync(path.join(process.cwd(), 'js', 'data.js'), 'utf8');
    vm.runInThisContext(source);
    const system = globalThis.CorrespondenceSystem;
    const record = system.create('outgoing', { id:'test-approval', number:'مسودة-test', subject:'اختبار مسار الاعتماد', status:'بانتظار التدقيق', department:'الديوان', to:'جهة اختبار' });
    assert.equal(record.status, 'بانتظار التدقيق');
    assert.equal(system.approve('outgoing', record.id).status, 'بانتظار الاعتماد');
    assert.equal(system.approve('outgoing', record.id).status, 'معتمدة');
    system.requestExtension('outgoing', record.id, { newDueDate:'2099-12-31', reason:'اختبار التمديد' });
    assert.equal(system.find('outgoing', record.id).extensionRequest.status, 'بانتظار الموافقة');
    system.decideExtension('outgoing', record.id, true, 'موافق');
    assert.equal(system.find('outgoing', record.id).dueDate, '2099-12-31');
    assert.equal(system.sla(system.find('outgoing', record.id)).state, 'on-time');
    assert.ok(system.auditLog().length >= 5);
  });
});
