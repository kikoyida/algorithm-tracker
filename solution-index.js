/* Tags are the source of truth: a solution may match several categories. */
window.solutionIndex = (() => {
  const categories = [
    { path: 'basics', name: '算法基础', tags: ['二分答案', '二分', '贪心', '前缀和', '双指针'] },
    { path: 'search', name: '搜索', tags: ['DFS', 'BFS', '回溯', '剪枝'] },
    { path: 'dp', name: '动态规划', tags: ['动态规划', '背包', '状态压缩'] },
    { path: 'string', name: '字符串', tags: ['字符串', 'KMP', '字典树'] },
    { path: 'math', name: '数学', tags: ['数学', '数论', '组合数学', '整除与取整'] },
    { path: 'ds', name: '数据结构', tags: ['数据结构', '线段树', '树状数组', '并查集'] },
    { path: 'graph', name: '图论', tags: ['图论', '最短路', '最小生成树', '拓扑排序'] },
    { path: 'geometry', name: '计算几何', tags: ['计算几何', '凸包'] },
    { path: 'misc', name: '杂项', tags: ['杂项'] }
  ];
  const articles = [{
    path: 'solutions/fjcpc2026-b', title: '2026 FJCPC B · 排考场',
    tags: ['二分答案', '贪心', '整除与取整'],
    summary: '判断无穷大情况，推导教室容量公式，再用二分答案最大化最小列间距。'
  }];
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const memberships = article => categories.filter(category => category.tags.some(tag => article.tags.includes(tag)));
  const badges = article => `<div class="article-entry__tags">${memberships(article).map(category => `<span>${escape(category.name)}</span>`).join('')}${article.tags.map(tag => `<span>${escape(tag)}</span>`).join('')}</div>`;
  const card = article => `<a class="article-entry" href="#/${article.path}"><div>${badges(article)}<h3>${escape(article.title)}</h3><p>${escape(article.summary)}</p><span class="article-entry__read">阅读题解</span></div><span class="article-entry__arrow" aria-hidden="true">↗</span></a>`;
  function render(content, route) {
    const path = route.replace(/^\//, '').replace(/\.md$/, '');
    const article = articles.find(item => item.path === path);
    if (article) return content.replace(/^(# .+)(\r?\n)/, (_, title, newline) => `${title}${newline}\n${badges(article)}\n\n`);
    const category = categories.find(item => item.path === path);
    if (!category && path !== 'solutions') return content;
    const matching = category ? articles.filter(item => memberships(item).includes(category)) : articles;
    // Replace only the original empty stub; preserve authored category notes.
    if (category && /^# [\w-]+\.md\s+内容建设中\.\.\.\s*$/.test(content)) content = `# ${category.name}\n`;
    return `${content}\n\n<div class="article-index"><div class="article-index__bar"><span>${category ? '相关题解' : '全部题解'}</span><span>${matching.length} 篇</span></div>${matching.length ? matching.map(card).join('') : '<p>这个分类暂时还没有题解。</p>'}</div>\n`;
  }
  return { categories, articles, memberships, render };
})();
