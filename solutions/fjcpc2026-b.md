# 2026 FJCPC B - 排考场

> 比赛：2026 CCPC 全国邀请赛（福建）暨第十三届福建省大学生程序设计竞赛  
> 核心算法：二分答案、贪心计算容量  
> 时间复杂度：`O(m log Cmax)`

## 题意简述

有 `N` 名学生和 `m` 间教室。第 `i` 间教室有 `R[i]` 行、`C[i]` 列。同一间教室可以使用若干列；只使用一列时列间距为无穷大。要求安排全部学生，并最大化所有教室的最小列间距。

## 无穷大的特殊情况

每间教室只使用一列时，总容量为 `sum(R[i])`。如果 `N <= sum(R[i])`，答案为无穷大，按题意输出 `-1`。

## 重点一：公式推导

要求列间距至少为 `d`，相邻使用列的编号至少相差 `d+1`：

```text
d = 2：使用 空 空 使用 空 空 使用
```

有 `C[i]` 列时，最多使用 `ceil(C[i] / (d+1))` 列：

```cpp
long long columns = C[i] - d * C[i] / (d + 1);
```

我的出发点是从总列数 $C$ 中减去作为间隔而不能坐人的列：

$$
\text{可用列数}=C-\left\lfloor\frac{dC}{d+1}\right\rfloor
$$

利用整数恒等式 $\lfloor C-x\rfloor=C-\lceil x\rceil$：

$$
C-\left\lfloor\frac{dC}{d+1}\right\rfloor
=C-\left\lfloor C-\frac{C}{d+1}\right\rfloor
=\left\lceil\frac{C}{d+1}\right\rceil
$$

因此它与标准向上取整完全等价。注意代码算的是 `(d*C)/(d+1)`，不能写成 `d*(C/(d+1))`，整数除法不能拆开。

该教室容量为 `R[i] * columns`；所有教室容量之和不少于 `N`，则 `d` 可行。

## 重点二：二分模板的理解

我们寻找的是 `check(d)` 由真变假的分界线：

```text
可行 可行 ... 可行 | 不可行 不可行 ...
```

模板的核心不是背代码，而是始终维护：`l` 一定可行，`r` 一定不可行。排除无穷大情况后：

```cpp
long long l = 0;     // 已知可行
long long r = maxC;  // 已知不可行
```

`l=0` 没有间隔要求，所以一定可行。当 `d = maxC` 时，每间教室至多使用一列，而此时 `sum(R[i]) < N`，所以 `r` 一定不可行。不能把右边界设成最小列数，因为小教室可以只用一列。

```cpp
while (l + 1 < r) {
    long long mid = l + (r - l) / 2;
    if (check(mid)) l = mid;
    else r = mid;
}
```

`mid` 可行时令 `l=mid`，否则令 `r=mid`，更新后两个边界不变量仍成立。循环条件 `l+1<r` 表示二者之间还有整数需要判断；结束时 `r=l+1`，所以 `l` 是最大可行值。

最后一次循环里的 `mid` 只是询问值，可能不可行，没有边界不变量。循环后重新计算 `mid` 虽然会得到 `l`，但直接输出 `l` 才体现模板含义。

## 完整代码（不使用 Lambda）

```cpp
#include <bits/stdc++.h>
using namespace std;

long long n;
int m;
vector<long long> R, C;

bool check(long long d) {
    long long total = 0;
    for (int i = 0; i < m; i++) {
        long long columns = C[i] - d * C[i] / (d + 1);
        total += R[i] * columns;
        if (total >= n) return true;
    }
    return false;
}

void solve() {
    cin >> n >> m;
    R.resize(m);
    C.resize(m);

    long long oneColumnCapacity = 0;
    long long maxC = 0;
    for (int i = 0; i < m; i++) {
        cin >> R[i] >> C[i];
        oneColumnCapacity += R[i];
        maxC = max(maxC, C[i]);
    }

    if (n <= oneColumnCapacity) {
        cout << -1 << '\n';
        return;
    }

    long long l = 0, r = maxC;
    while (l + 1 < r) {
        long long mid = l + (r - l) / 2;
        if (check(mid)) l = mid;
        else r = mid;
    }
    cout << l << '\n';
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    solve();
    return 0;
}
```

## 初版易错点

1. 不能在 `solve()` 内定义普通 `check()` 函数。
2. `N` 与 `n` 大小写不同。
3. 读取时不要忘记更新 `maxC`。
4. 输出最大可行边界 `l`，不是旧的 `mid`。

## 复盘

```text
最大化最小值
-> 固定答案 d
-> 计算最大容量
-> 判断是否可行
-> 发现单调性
-> 二分最大的可行 d
```

以后看到“最大化最小值”或“最小化最大值”，优先尝试固定答案并设计 `check()`。
