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
  const article = index.render('article', `/journal/${entry.date}`);
  assert.match(article, /<nav class="journal-navigation" aria-label="日志导航">/);
  assert.match(article, /<a class="journal-back" href="#\/journal">/,
    'Use a raw HTML route link: Docsify rewrites Markdown hash links as article anchors.');
  assert(article.includes('返回全部日志'));
  assert(!article.includes('[返回全部日志](#/journal)'));
  assert.equal((article.match(/class="journal-back"/g) || []).length, 1);
  assert.equal(index.render('article', `/journal/${entry.date}.md`), article);
}
assert.equal(index.render('unchanged', '/solutions'), 'unchanged');
assert.equal(index.render('unchanged', '/graphics-technical-artist'), 'unchanged');
assert.equal(index.render('# 日志', '/journal.md'), archive);
console.log('Passed: latest three, archive, article routes, backlinks, unrelated pages.');
