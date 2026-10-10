const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'solution-index.js'), 'utf8'), context);
const index = context.window.solutionIndex;
const route = 'graphics-technical-artist/essence-linear-algebra';
const article = index.articles.find(entry => entry.path === route);
assert(article, 'Course note must be registered');
assert.deepEqual(Array.from(index.memberships(article), category => category.path), ['math', 'geometry']);
for (const category of ['math', 'geometry']) {
  assert(index.render('# category', `/${category}`).includes(`#/${route}`));
}
const content = fs.readFileSync(path.join(root, `${route}.md`), 'utf8');
assert(content.startsWith('# '), 'Published note must start with its heading');
assert(!content.includes('[['), 'Published note must not retain Obsidian wiki syntax');
assert.equal((content.match(/^## 第 [123] 课/gm) || []).length, 3);
assert(content.includes('唯一解是'));
assert(content.includes('不全为零'));
const rendered = index.render(content, `/${route}`);
assert(rendered.includes('article-entry__tags'));
assert(rendered.includes('<span>数学</span>'));
assert(rendered.includes('<span>计算几何</span>'));
const imageUrl = 'https://kikoyida.github.io/algorithm-tracker/assets/notes/linear-algebra-basis-matrix.png';
assert(content.includes(imageUrl), 'Screenshot URL must be absolute for nested Docsify routes');
assert(fs.existsSync(path.join(root, 'assets/notes/linear-algebra-basis-matrix.png')));
const landing = fs.readFileSync(path.join(root, 'graphics-technical-artist.md'), 'utf8');
assert(landing.includes(`#/${route}`));
assert.equal((landing.match(/class="article-entry"/g) || []).length, 4);
assert(landing.includes('04 ARTICLES'));
const projectionRoute = 'graphics-technical-artist/view-transform-perspective-projection';
const projectionArticle = index.articles.find(entry => entry.path === projectionRoute);
assert(projectionArticle, 'Projection note must be registered');
assert.deepEqual(Array.from(index.memberships(projectionArticle), category => category.path), ['math', 'geometry']);
assert(landing.includes(`#/${projectionRoute}`));
for (const category of ['math', 'geometry']) {
  assert(index.render('# category', `/${category}`).includes(`#/${projectionRoute}`));
}
const projectionContent = fs.readFileSync(path.join(root, `${projectionRoute}.md`), 'utf8');
assert(projectionContent.startsWith('# 视图变换与透视投影'));
assert(!projectionContent.includes('> [!'), 'Convert Obsidian callout markers for web reading');
assert(projectionContent.includes('\\boxed{V=C^{-1}}'));
assert(projectionContent.includes('\\triangle OAP\'\\sim\\triangle OCP'));
const projectionImages = [...projectionContent.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)].map(match => match[1]);
assert.equal(projectionImages.length, 2);
for (const image of projectionImages) {
  assert(image.startsWith('https://kikoyida.github.io/algorithm-tracker/assets/notes/'));
  assert(fs.existsSync(path.join(root, new URL(image).pathname.replace('/algorithm-tracker/', ''))));
}
console.log('Passed: Graphics entries, course order, definitions, math/geometry memberships, projection note and images.');
