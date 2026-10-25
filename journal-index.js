/* Published journals only. Drafts in Obsidian are added after review. */
window.journalIndex = (() => {
  const entries = [
    { date: '2026-10-25', title: '海洋沙滩教程与海湾场景', summary: '海洋沙滩教程笔记、Nanite 置换与地表拉伸的理解，AI 协助检查岩石缺面，以及海湾岩石资源和 Water 水体方案。' },
    { date: '2026-10-22', title: '灯光、天空系统与 Lumen', summary: '整理深度缓冲、UE 灯光与天空系统笔记，通过问答理解 Lumen 间接光、颜色溢出和反弹路径，并回顾已有渲染知识。' },
    { date: '2026-10-20', title: '水面倒影、场景模糊与穿林光束', summary: 'SP 烘焙用途、第一幕转场与分支同步，场景渐暗模糊、水面倒影和脚步涟漪调试，以及围巾重做尝试与第二幕穿林光束。' },
    { date: '2026-10-19', title: '手里剑 UV、第二幕场景与结尾转场', summary: '飞刃 UV 与发光侧边、手里剑 SP 试材质，Unity 第二幕美术和碰撞调整，以及 AI 协助的结尾转场与倒影方案讨论。' },
    { date: '2026-10-15', title: '海湾场景搭建、UE MCP 与课程安排', summary: '海湾地形与悬崖资产试摆、UE MCP 连接及 AI 协助灰模调整，图形学后续课程与作品集讨论，以及学院系统阶段提交。' },
    { date: '2026-10-14', title: 'PBR 课程、作品集参考与 Niagara', summary: '观看 PBR 课程后讨论材质流程与粗糙度，拆解技术美术作品集并调整规划，以及完成 Niagara 课程 P1、建立基本系统。' },
    { date: '2026-10-13', title: '奇幻遗迹构思、留声机课程与 Niagara', summary: '奇幻遗迹参考与魔法交互 Demo 构思、资产流程和渲染概念，以及留声机课程观看与 Niagara 系统初试。' },
    { date: '2026-10-12', title: 'midjourney 课程、场景概念设计', summary: 'midjourney 课程中的构图与引导线、Lovart 参考拼贴和提示词组合，以及模块化建筑参考与 tripo 3d 制作流程的学习。' },
    { date: '2026-10-11', title: 'midjourney 生图、深海场景参考', summary: 'midjourney 基本操作与 AI 概念生图尝试、深海场景的构图和氛围选择，以及近期跟着教程搭建场景的安排。' },
    { date: '2026-10-10', title: '着色器、矩阵与透视投影', summary: '着色器类型与渲染管线、二维和三维矩阵练习、MVP 与齐次坐标，以及投影笔记整理、深度映射和遮挡判断。' },
    { date: '2026-10-09', title: '矩阵复习、LOD 与 QEM', summary: '透视投影与齐次坐标复习、性能预算驱动的 LOD Demo 讨论，以及 QEM 二维误差计算、偏导与凸函数的入门学习。' },
    { date: '2026-10-08', title: 'UV 与 SP 材质练习、透视投影', summary: '多零件 UV 与纹理分配、控制箱 SP 材质和模型排错，以及透视投影、MVP、近裁剪面与 FOV 的学习。' },
    { date: '2026-10-07', title: 'UV 展开、挤出操作与 PBR 资产计划', summary: 'UV 展开与练习素材、两种挤出操作的区别，以及完整 PBR 资产制作和作品集方向的规划。' },
    { date: '2026-10-05', title: '线性代数、深度缓冲与模型拓扑', summary: '线性代数前 3 课、张成空间与线性无关、Z-buffer 和模型拓扑，以及多进程通信题的学习。' },
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
    // Raw HTML keeps Docsify from rewriting this route as an in-article heading anchor.
    if (entries.some(entry => path(entry) === current)) return `${content}\n\n<nav class="journal-navigation" aria-label="日志导航"><a class="journal-back" href="#/journal"><span aria-hidden="true">←</span><span>返回全部日志</span></a></nav>\n`;
    return content;
  }
  function mountHomepage() {
    const target = document.getElementById('journalEntries');
    if (target) target.innerHTML = entries.slice(0, 3).map(homepageCard).join('');
  }
  return { entries, render, mountHomepage, homepageCard };
})();
