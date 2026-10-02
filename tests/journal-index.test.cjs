const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const target = { innerHTML: '' };
const context = { window: {}, document: { getElementById: () => target } };
vm.runInNewContext(fs.readFileSync(path.join(root, 'journal-index.js'), 'utf8'), context);
const index = context.window.journalIndex;
assert(index.entries.length >= 5);
index.mountHomepage();
assert.equal((target.innerHTML.match(/class="journal__entry"/g) || []).length, 3);
for (const entry of index.entries.slice(0, 3)) assert(target.innerHTML.includes(entry.date));
for (const entry of index.entries.slice(3)) assert(!target.innerHTML.includes(entry.date));
const archive = index.render('# 日志', '/journal');
assert.equal((archive.match(/class="article-entry"/g) || []).length, index.entries.length);
for (const entry of index.entries) {
  assert(fs.existsSync(path.join(root, 'journal', `${entry.date}.md`)));
  assert(archive.includes(`#/journal/${entry.date}`));
  assert(index.render('article', `/journal/${entry.date}`).includes('返回全部日志'));
}
assert.equal(index.render('unchanged', '/solutions'), 'unchanged');
assert.equal(index.render('unchanged', '/graphics-technical-artist'), 'unchanged');
assert.equal(index.render('# 日志', '/journal.md'), archive);
console.log('Passed: latest three, archive, article routes, backlinks, unrelated pages.');
