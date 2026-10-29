# BRDF、GGX 与微表面渲染方程｜图文笔记

> **整理说明**：按我们的原始讨论顺序保留解释、公式、示意图和知识点小模块。部分光线路径图重新绘制；GGX / Beckmann 原始对照图片的来源保留在第 6 节，便于对照。

> **贯穿全篇的一句话**：渲染方程决定如何累计光，BRDF 决定一个表面如何把来自不同方向的光反射出去，而微表面模型用 **D、F、G** 描述镜面反射。

![从入射光到屏幕输出的概念流程](https://kikoyida.github.io/algorithm-tracker/assets/notes/brdf-microfacet/rendering-flow.png)

*从入射光到屏幕输出的概念流程*

## 模块 01｜从 Roughness 理解镜面反射

### 为什么粗糙度越高，高光越宽？

我们最早讨论的直觉是：光滑表面将反射集中到少数方向，粗糙表面则将反射分散到更广的方向。

- **低 Roughness**：高光集中、明亮、边缘锐利。

- **高 Roughness**：高光分散、宽阔、边缘柔和。

- 这里说的是**反射方向的分布**，不是“越光滑就一定反射更多总能量”。

![不同粗糙度的高光示意](https://kikoyida.github.io/algorithm-tracker/assets/notes/brdf-microfacet/roughness-highlights.png)

*同一种材质，不同粗糙度的高光示意*

**容易混淆的小点｜能量守恒**

被动材质不能输出多于自身所接收的能量。高光峰值变低，不自动意味着全部反射能量减少；它也可能只是被分配到更广的角度。真实微表面模型还会受到菲涅耳效应、遮挡以及多次散射的影响。

### 微表面理论 Microfacet Theory

宏观上看起来平坦的表面，在微观尺度上也可被抽象为大量很小的平面（microfacets）。各微平面有自己的法线方向。

![微表面法线方向的比较](https://kikoyida.github.io/algorithm-tracker/assets/notes/brdf-microfacet/microfacet-normals.png)

*微表面法线方向的比较*

**对照理解**

![Normal 与 Roughness 对照表](https://kikoyida.github.io/algorithm-tracker/assets/notes/brdf-microfacet/normal-roughness-table.png)

因此 Normal Map 和 Roughness Map 完全可以在同一个 PBR 材质中同时存在：二者描述的是不同尺度的表面特征。

## 模块 02｜BRDF 到底是什么？

**BRDF** = **Bidirectional Reflectance Distribution Function**，双向反射分布函数。

> 当光从方向 A 照到一个点时，这个点会向观察方向 B 反射多少光？

![BRDF 入射方向、观察方向与法线](https://kikoyida.github.io/algorithm-tracker/assets/notes/brdf-microfacet/brdf-directions.png)

*BRDF 入射方向、观察方向与法线*

> **图中箭头约定**：蓝色箭头画的是光朝表面传播的方向；下面公式中的 $\omega_i$ 采用从表面指向光源的约定，与蓝色传播箭头相反。

- $\omega_i$：入射方向。图形学中常用从表面点**指向光源**的向量表示它。

- $\omega_o$：出射 / 观察方向，通常从表面点指向摄像机。

- $N$：着色法线。

它的定义可写为：

$$
f_r(\omega_i,\omega_o)=\frac{dL_o(\omega_o)}{dE_i(\omega_i)}
$$

- $dL_o$：由这部分入射光所产生、朝指定出射方向的**辐亮度增量**。

- $dE_i$：指定入射方向微小立体角贡献的**辐照度增量**。

- BRDF 的单位是 $\mathrm{sr}^{-1}$（每球面度）。

注意：BRDF 不是“直接返回整个像素亮度”的函数；它给渲染方程提供**反射分布规律**。

**和 Roughness 的关系**：Roughness 是某些 BRDF 模型的输入参数；BRDF 规定了参数如何影响角度分布与高光。

## 模块 03｜GAMES101 已经学过的两个模型

### 3.1 Lambert 漫反射

理想 Lambert 漫反射的 BRDF：

$$
f_d=\frac{\rho}{\pi}
$$

$\rho$ 是漫反射率。它与观察方向无关，所以理想漫反射没有镜面高光。

对于单个方向光源，漫反射的亮度包含余弦权重：

$$
I_d\propto\max(0,N\cdot L)
$$

**为什么有点积？** 因为光以倾斜角度照到一个面时，同样的光通量会分布到更大的表面积，因此单位面积得到的能量变少。

### 3.2 Blinn–Phong 高光

半程向量：

$$
H=\frac{L+V}{\|L+V\|}
$$

- $L$：从表面点指向光源。

- $V$：从表面点指向观察者。

- $H$：$L$ 和 $V$ 的单位角平分向量。

经典的经验高光公式：

$$
I_s\propto\max(0,N\cdot H)^p
$$

$p$ 越大，高光越窄越集中；$p$ 越小，高光越宽。

**小模块｜别混淆**：经典 Blinn–Phong 是经验着色模型，**不等于**自动满足能量守恒、具有完整 F/G 项的现代微表面 BRDF。它的余弦幂形式可以改造为微表面法线分布函数。

## 模块 04｜渲染方程：把所有方向的光累加

光源不只一个；太阳、天空、墙面的间接反射，都可能在一个点上产生入射光。因此需要对入射方向进行积分。

$$
L_o(x,\omega_o)=L_e(x,\omega_o)+\int_{\Omega^+}f_r(x,\omega_i,\omega_o)\,L_i(x,\omega_i)(N\cdot\omega_i)\,d\omega_i
$$

![渲染方程各项含义](https://kikoyida.github.io/algorithm-tracker/assets/notes/brdf-microfacet/rendering-equation-table.png)

**一句话概括**：最终看到的光 = 自发光 + 各方向的光经反射后累加的贡献。

**重点区分**：

- **渲染方程**回答“如何累加光照？”

- **BRDF**回答“某个方向的光如何反射？”

- **GGX/Beckmann 等法线分布函数**回答“微表面有多少朝向某个方向？”

所以 **GGX 并没有一套完全不同的渲染方程**；它只是决定了渲染方程中 BRDF 的一种构造方式。

## 模块 05｜Cook–Torrance：D、F、G 是怎么组合的？

现代游戏常使用 Cook–Torrance 形式的微表面镜面反射 BRDF：

$$
f_s(L,V)=\frac{D(H)\,F(V,H)\,G(L,V)}{4(N\cdot L)(N\cdot V)}
$$

假设 $L$、$V$ 与 $N$ 位于表面正面半球，且相关点积为正。

### 知识点卡 D｜Distribution / NDF

**有多少微表面法线朝向半程向量 H？**

- 影响高光形状和宽度。

- Roughness 通常首先改变 D 的分布。

- GGX、Beckmann、Blinn 型分布的核心差异就在这里。

### 知识点卡 F｜Fresnel

**入射到微表面边界的光，有多大比例发生反射？**

- 随入射 / 观察角度变化。

- 解释掠射角时反射通常增强。

- 与 $F_0$（正面反射率）、Metallic 关系密切。

### 知识点卡 G｜Geometry

**这些微表面真的能接受光、并让反射光离开吗？**

- Shadowing：入射光被其他微表面遮住。

- Masking：反射光离开时被其他微表面遮住。

- 常见实现：Smith G、Schlick–GGX G。

### 分母为什么存在？

$4(N\cdot L)(N\cdot V)$ 是从微表面面积、方向和投影几何关系推导 BRDF 时出现的转换因子，**不是为了画面好看而额外加的亮度系数**。

> **复习口诀**：**D 管方向分布，F 管反射比例，G 管可见性。**

## 模块 06｜三类法线分布：GGX / Beckmann / Blinn 型

这里比较的是主要决定高光分布的 **D 项（Normal Distribution Function, NDF）**，而不是三套独立的渲染方程。

### 6.1 GGX / Trowbridge–Reitz

$$
D_{\mathrm{GGX}}=\frac{\alpha^2}{\pi\left[(N\cdot H)^2(\alpha^2-1)+1\right]^2}
$$

- $\alpha$：微表面粗糙度参数。

- 常见实时渲染参数化：$\alpha=\mathrm{Roughness}^2$，但具体映射仍以引擎实现为准。

- **特征：Long Tail / 长尾分布。** 远离主要反射方向时，GGX 通常保留比 Beckmann 更明显的分布权重。

长尾不是“光被凭空增加”，而是说明能量在更远离主高光方向的位置仍有贡献。

### 6.2 Beckmann

$$
D_{\mathrm{Beckmann}}=\frac{e^{-\tan^2\theta_h/\alpha^2}}{\pi\alpha^2\cos^4\theta_h}
$$

其中 $\cos\theta_h=N\cdot H$。Beckmann 的尾部一般衰减得更快。

### 6.3 Blinn–Phong 型 NDF

把经典余弦幂形式归一化后，可以作为一个微表面法线分布：

$$
D_{\mathrm{Blinn}}=\frac{p+2}{2\pi}\max(0,N\cdot H)^p
$$

$p$ 越大，分布越集中。不过 **这个 D 函数并不等于完整的 Blinn–Phong BRDF**；还需要合理构造 F、G 等部分。

### 视觉比较

![GGX、Beckmann 与 Blinn 型分布比较](https://kikoyida.github.io/algorithm-tracker/assets/notes/brdf-microfacet/ndf-comparison.png)

*重绘：GGX 与 Beckmann 的法线分布对比*

**我们原先一起看的两张参考图（官方原图链接）：**

- [OTOY / Octane：GGX 与 Beckmann 不同 Roughness 的球体渲染对比](https://docs.otoy.com/ModoH/Resources/Images/Modo/BRDF_Models_2019_1_5_01.png)（也可见 [官方说明页](https://docs.otoy.com/blender/BRDFModels.html)）。

- [Stanford CS348B：Beckmann 与 Trowbridge–Reitz / GGX 的法线分布曲线](https://gfxcourses.stanford.edu/cs348b/spring22/lecture/reflection2/slide_25)。

![三类法线分布模型的比较](https://kikoyida.github.io/algorithm-tracker/assets/notes/brdf-microfacet/ndf-models-table.png)

**保留原讨论的重点**：GGX 和 Beckmann 都可以是合理模型；不能说“GGX 物理正确，Beckmann 错误”。只是它们对应不同的统计假设和反射特征。

## 模块 07｜F 项：Fresnel–Schlick

实时 PBR 常使用 Schlick 近似：

$$
F=F_0+(1-F_0)(1-V\cdot H)^5
$$

- $F_0$：从正面观察时的反射率。

- 对很多常见非金属介质，$F_0\approx0.04$ 是实用近似（不是所有非金属都恰好 0.04）。

- 金属的 $F_0$ 往往具有彩色 RGB 反射特征。

- 掠射角反射通常更强，所以同一块材质在不同角度看上去反射程度不同。

这解释了为什么 **Metallic 与 Base Color** 会一起影响 PBR 镜面反射。

## 模块 08｜G 项：微表面之间的遮蔽

![Masking 与 Shadowing 简化示意](https://kikoyida.github.io/algorithm-tracker/assets/notes/brdf-microfacet/masking-shadowing.png)

*Masking / Shadowing 简化示意*

在微表面模型里，即使一个小平面的法线方向恰好能够把光反射到摄像机，也不意味着这束光一定可以顺利离开表面。

**Smith Geometry Function** 是常见的遮蔽建模方案。一种 GGX 单方向可见性表达式为：

$$
G_1(V)=\frac{2(N\cdot V)}{(N\cdot V)+\sqrt{\alpha^2+(1-\alpha^2)(N\cdot V)^2}}
$$

在独立遮蔽近似下：

$$
G(L,V)\approx G_1(L)G_1(V)
$$

实际引擎也可能使用 **Height-Correlated Smith** 或 **Schlick–GGX** 近似。不同 NDF 应搭配相应的几何模型，不能毫无依据地混合。

## 模块 09｜把 D、F、G 代入渲染方程

简化的 PBR BRDF 可以拆成漫反射和镜面反射：

$$
f_r=f_d+f_s
$$

以 Lambert 漫反射 + Cook–Torrance 镜面反射为例：

$$
f_r=k_d\frac{C}{\pi}+\frac{DFG}{4(N\cdot L)(N\cdot V)}
$$

- $C$：线性空间中的 Base Color。

- $k_d$：漫反射权重；对金属通常为零或接近零。

代入渲染方程（为阅读方便，省略部分自变量）：

$$
L_o=L_e+\int_{\Omega^+}\left[k_d\frac{C}{\pi}+\frac{DFG}{4(N\cdot L)(N\cdot V)}\right]L_i(N\cdot L)\,d\omega_i
$$

**现在可以串起来了**：

- 渲染方程要求把各方向的光照贡献积分。

- BRDF 告诉我们每一份入射光按什么规则反射。

- Cook–Torrance 通过 D/F/G 计算镜面 BRDF。

- GGX、Beckmann 等替换的通常主要是 D，并应合理选择相配的 G。

换 D 之后，**渲染方程外层结构并没有变化**。

## 模块 10｜单次微表面反射与多次散射

经典单次散射微表面 BRDF 主要考虑光在微表面的一次镜面反射。但光也可能先撞上一个微面元，反射后又撞上第二个、第三个，最后才离开表面。

如果模型忽略后面的反射路径，尤其对高 Roughness 表面，就可能低估最终反射能量，让表面显得过暗。

一种改善思路是 **Multiple-Scattering Energy Compensation**，例如 GAMES202 作业中涉及的 **Kulla–Conty** 方法。

**联系最早的问题**：高 Roughness 让高光分散；但光能是否被正确统计，取决于使用的是单次反射模型还是包含多次散射补偿的模型。

## 模块 11｜对应到 UE5 材质节点

![UE5 材质参数与反射模型对应关系](https://kikoyida.github.io/algorithm-tracker/assets/notes/brdf-microfacet/ue-material-table.png)

这些参与的是材质与光照计算。**Tone Mapping** 则通常发生在 HDR 场景结果产生之后，属于显示映射环节，不是 BRDF 的一部分。

![从入射光到屏幕输出的概念流程](https://kikoyida.github.io/algorithm-tracker/assets/notes/brdf-microfacet/rendering-flow.png)

*渲染概念流程回顾*

## 模块 12｜公式需不需要背？

**不用死记完整公式，更重要的是理解 → 实现 → 实验 → 必要时推导。**

![公式学习要求对照表](https://kikoyida.github.io/algorithm-tracker/assets/notes/brdf-microfacet/formula-study-table.png)

真正写 Shader 时，比死记复杂公式更重要的是：能阅读原始论文和源码、正确实现、构造测试场景、观察数值与视觉变化、发现性能问题。

## 模块 13｜后续待深入（自测清单）

- [ ] 为什么点积对应夹角余弦？

- [ ] 为什么 BRDF 的单位是 $\mathrm{sr}^{-1}$？

- [ ] 渲染方程的半球积分在实时渲染中怎样计算 / 近似？

- [ ] GGX 的长尾如何改变镜面高光？

- [ ] NDF 为什么要满足归一化条件？

- [ ] 为什么改变观察方向，即使 $N\cdot H$ 不变，最终反射亮度仍可能变化？

- [ ] Smith G 的不同版本有什么代价与差异？

- [ ] 为什么单次微表面散射会产生能量损失？

- [ ] 如何在 HLSL / GLSL 中写出 GGX + Fresnel–Schlick + Smith G？

- [ ] 怎样设计一个可调 Roughness、Metallic、光照角度的 BRDF Explorer？

## 参考资料 / 原始图片来源

- [LearnOpenGL：PBR Theory](https://learnopengl.com/PBR/Theory)

- [PBRT v4：Roughness Using Microfacet Theory](https://pbr-book.org/4ed/Reflection_Models/Roughness_Using_Microfacet_Theory)

- [Epic：Real Shading in Unreal Engine 4（SIGGRAPH 2013）](https://cdn2.unrealengine.com/Resources/files/2013SiggraphPresentationsNotes-26915738.pdf)

- [OTOY：BRDF Models 官方图示与比较](https://docs.otoy.com/blender/BRDFModels.html)

- [Stanford CS348B：Reflection II 第 25 页图](https://gfxcourses.stanford.edu/cs348b/spring22/lecture/reflection2/slide_25)

**最终总结：** 渲染方程累计光照；BRDF 定义反射分布；微表面 Cook–Torrance 用 D/F/G 描述镜面反射；GGX / Beckmann / Blinn 型 NDF 的主要差别在法线分布形状。掌握这些，是从 GAMES101 的经验着色走向现代 PBR Shader 的关键一步。
