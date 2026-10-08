/* Published journals only. Drafts in Obsidian are added after review. */
window.journalIndex = (() => {
  const entries = [
    { date: '2026-10-07', title: 'UV 展开、挤出操作与 PBR 资产计划', summary: 'UV 展开与练习素材、两种挤出操作的区别，以及完整 PBR 资产制作和作品集方向的规划。' },
    { date: '2026-10-04', title: '水下光柱调试、Blender 建模操作', summary: '水下光柱与后处理排查、焦散遮罩和阶段备份，以及 Blender 缩放、布尔操作与渲染管线基础。' },
    { date: '2026-10-03', title: '水下光照调试、色块绘画', summary: '水下场景整理、焦散与体积光排查、色块绘画，以及课程和后续学习安排。' },
    { date: '2026-10-02', title: 'SP 材质、焦散 HLSL 与作品集规划', summary: 'SP 岩石与海床材质、同模型批量赋材质工具、焦散深度与范围遮罩，以及技术美术作品集规划。' },
    { date: '2026-10-01', title: '水下场景灰模、焦散材质调试', summary: '层叠岩台场景参考、Blender 岩石与 UE 灰模，以及焦散效果的接入和强度调整计划。' },
    { date: '2026-09-30', title: 'UE 材质练习、LogSigmoid 算子优化', summary: '石化材质、法线烘焙基础、消防栓重做计划，以及算子评测和随机头像功能。' },
    { date: '2026-09-29', title: '消防栓模型修整、Aervox 界面调整', summary: '接口与倒角排查、底座拓扑修整，以及标准模式和陪伴模式的界面实践。' },
    { date: '2026-09-28', title: 'Blender 消防栓练习、界面风格参考', summary: '底座与主体搭建、技术美术学习规划，以及现代日系界面和中文字体参考。' },
    { date: '2026-09-27', title: '从填满一个三角形，到读出模型的轮廓', summary: 'TinyRenderer 三角形填充与 OBJ 线框绘制、学习笔记整理，以及 AI RPG 的实现边界。' }
  ].sort((a, b) => b.date.localeCompare(a.date));
  const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const path = entry => `journal/${entry.date}`;
  const dateLabel = entry => entry.date.replace(/-/g, ' / ');
  const articleCard = entry => `<a class="article-entry" href="#/${path(entry)}"><div><div class="article-entry__tags"><span><time datetime="${entry.date}">${dateLabel(entry)}</time></span></div><h3>${escape(entry.title)}</h3><p>${escape(entry.summary)}</p><span class="article-entry__read">阅读日志</span></div><span class="article-entry__arrow" aria-hidden="true">↗</span></a>`;
  const homepageCard = entry => `<a class="journal__entry" href="docs.html#/${path(entry)}"><time datetime="${entry.date}">${dateLabel(entry)}</time><h3>${escape(entry.title)}</h3><p>${escape(entry.summary)}</p><span>阅读日志 ↗</span></a>`;
  function render(content, route) {
    const current = route.replace(/^\//, '').replace(/\.md$/, '');
    if (current === 'journal') return `${content}\n\n<div class="article-index"><div class="article-index__bar"><span>全部日志</span><span>${entries.length} 篇</span></div>${entries.length ? entries.map(articleCard).join('') : '<p>暂时还没有日志。</p>'}</div>\n`;
    if (entries.some(entry => path(entry) === current)) return `${content}\n\n[返回全部日志](#/journal)\n`;
    return content;
  }
  function mountHomepage() {
    const target = document.getElementById('journalEntries');
    if (target) target.innerHTML = entries.slice(0, 3).map(homepageCard).join('');
  }
  return { entries, render, mountHomepage, homepageCard };
})();
