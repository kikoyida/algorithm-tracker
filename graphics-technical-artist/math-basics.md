# TA 数学基础

## 原始手写笔记

[![TA 数学手写笔记](assets/notes/technical-art-math.png)](assets/notes/technical-art-math.png ":ignore")

[点击查看高清原图](assets/notes/technical-art-math.png ":ignore")

## 学习地图

- `normalize`：只保留方向，把向量长度变成 1。
- `lerp`：在两个值之间按比例移动或混合。
- `dot`：判断两个方向的接近程度。
- `cross`：判断左右、转向或求垂直方向。
- `clamp`：把数值限制在任意范围。
- `saturate`：把数值限制在 `[0,1]`。
- `step`：生成硬边遮罩。
- `smoothstep`：生成柔和遮罩。
- UV：模型表面读取二维贴图的位置。
- UV 变换：移动、缩放或旋转贴图的读取位置。

## 1. 归一化 normalize

归一化会保持向量方向不变，把长度变成 1：

$$
\operatorname{normalize}(v)=\frac{v}{\lVert v\rVert}
$$

例如：

$$
v=(3,4),\quad \lVert v\rVert=5
$$

$$
\operatorname{normalize}(v)=(0.6,0.8)
$$

```hlsl
float3 unitDirection = normalize(direction);
```

归一化后，向量只表示“朝哪里”，不再携带原来的长度。零向量不能正常归一化。

## 2. 线性插值 lerp

`lerp(A, B, t)` 可以理解为：从 A 走向 B，走比例 `t`。

$$
\operatorname{lerp}(A,B,t)=A(1-t)+Bt
$$

```text
lerp(10, 20, 0)   = 10
lerp(10, 20, 0.5) = 15
lerp(10, 20, 1)   = 20
```

混合颜色：

```hlsl
float3 red  = float3(1, 0, 0);
float3 blue = float3(0, 0, 1);
float3 color = lerp(red, blue, 0.5);
// 结果为 (0.5, 0, 0.5)，即紫色
```

使用遮罩混合材质：

```hlsl
float3 finalColor = lerp(rockColor, grassColor, mask);
```

- `mask = 0`：完全显示石头。
- `mask = 1`：完全显示草地。
- `mask = 0.5`：各占一半。

`t` 不一定是时间，它也可以是遮罩或任意混合比例。若只允许 `[0,1]`：

```hlsl
lerp(A, B, saturate(t));
```

## 3. 点积 dot

$$
A\cdot B=A_xB_x+A_yB_y+A_zB_z
$$

- `dot > 0`：夹角小于 90°，两个方向比较接近。
- `dot = 0`：夹角为 90°，两个方向垂直。
- `dot < 0`：夹角大于 90°，两个方向相反。

如果两个向量都已经归一化：

$$
A\cdot B=\cos\theta
$$

因此结果会落在 `[-1,1]`：

- `1`：方向完全相同。
- `0`：互相垂直。
- `-1`：方向完全相反。

最简单的明暗：

```hlsl
float brightness = saturate(dot(normal, lightDirection));
```

## 4. 叉积 cross

在二维平面中，用 A→B 与 A→P 的叉积判断 P 在有向直线 AB 的哪一侧：

$$
\operatorname{cross}(A,B,P)
=(B_x-A_x)(P_y-A_y)-(B_y-A_y)(P_x-A_x)
$$

> **易错点**
> 两项之间是减号，不是加号。

- `cross > 0`：从 AB 转向 AP 是逆时针，P 在 AB 左侧。
- `cross < 0`：从 AB 转向 AP 是顺时针，P 在 AB 右侧。
- `cross = 0`：A、B、P 三点共线。

```cpp
long long cross(Point A, Point B, Point P) {
    return (B.x - A.x) * (P.y - A.y)
         - (B.y - A.y) * (P.x - A.x);
}
```

交换 A、B 后，有向直线方向改变，左右也会交换。

## 5. clamp 与 saturate

### clamp

把数值限制在指定范围：

```hlsl
clamp(x, minimum, maximum)
```

```text
clamp(7,  0, 10) = 7
clamp(-2, 0, 10) = 0
clamp(20, 0, 10) = 10
```

### saturate

`saturate` 专门把数值限制在 `[0,1]`：

```hlsl
saturate(x) == clamp(x, 0, 1)
```

```text
saturate(-0.5) = 0
saturate(0.3)  = 0.3
saturate(2.0)  = 1
```

Shader 中颜色、遮罩和百分比经常使用 `[0,1]`，因此 `saturate` 很常见。

## 6. step 与 smoothstep

二者都可以把连续数值转换成遮罩。

### step：硬切

```hlsl
step(edge, x)
```

可以理解为：

```cpp
if (x < edge) return 0;
else          return 1;
```

第一个参数 `edge` 是分界线，第二个参数 `x` 是被判断的值。

适合制作硬边圆形、黑白遮罩、卡通色阶和溶解裁切。

### smoothstep：平滑过渡

```hlsl
smoothstep(start, end, x)
```

- `x <= start`：结果为 0。
- `x >= end`：结果为 1。
- 中间：从 0 平滑变化到 1。

它不是普通的线性渐变，两端的变化会比较平缓。适合制作柔和边缘、距离淡出和柔和溶解。

```text
step       = 突然开关
smoothstep = 柔和开关
```

## 7. UV 与 UV 变换

UV 是模型表面读取二维贴图的位置。常见约定：

```text
左下：(0,0)    右下：(1,0)
左上：(0,1)    右上：(1,1)
```

```hlsl
float3 color = Texture.Sample(Sampler, uv);
```

### 平移

```hlsl
float2 movedUV = uv + offset;
float2 animatedUV = uv + time * speed;
```

可用于流水、云、能量流和传送带。

### 缩放

```hlsl
float2 scaledUV = uv * scale;
```

贴图开启重复采样时，`scale` 越大，图案通常越密。

### 绕中心旋转

UV 中心是 `(0.5,0.5)`：

```hlsl
float2 centered = uv - 0.5;

float c = cos(angle);
float s = sin(angle);

float2 rotated;
rotated.x = centered.x * c - centered.y * s;
rotated.y = centered.x * s + centered.y * c;

rotated += 0.5;
```

记忆顺序：减去中心 → 旋转 → 加回中心。

## 速查

```text
normalize   保留方向，把长度变成 1
lerp        在 A 与 B 之间按比例混合
dot         判断两个方向的接近程度
cross       判断左右和转向
clamp       限制到任意范围
saturate    限制到 [0,1]
step        生成硬边遮罩
smoothstep  生成柔和遮罩
UV          贴图读取坐标
```
