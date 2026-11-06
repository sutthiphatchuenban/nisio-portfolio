// Calendar behavior at Thai month boundaries is part of the automatic-theme contract.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../lib/theme-catalog.ts'), 'utf8');
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const context = { exports: {}, Intl, Date };
vm.runInNewContext(code, context);
const { getFestivalForDate, FESTIVAL_THEMES, THEME_IDS } = context.exports;
assert.equal(FESTIVAL_THEMES.length, 12);
assert.equal(new Set(THEME_IDS).size, 16);
for (let month = 0; month < 12; month++) {
  assert.equal(getFestivalForDate(new Date(Date.UTC(2026, month, 15))).id, FESTIVAL_THEMES[month].id);
}
assert.equal(getFestivalForDate(new Date('2026-03-31T16:59:59Z')).id, 'sakura');
assert.equal(getFestivalForDate(new Date('2026-03-31T17:00:00Z')).id, 'songkran');
assert.equal(getFestivalForDate(new Date('2026-12-31T17:00:00Z')).id, 'newyear');
console.log('PASS: monthly themes and Bangkok calendar boundaries');
